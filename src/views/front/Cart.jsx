import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCart, updateCartItem, removeCartItem, clearCart, optimisticUpdateQty } from "@/store/cartSlice";
import { toast } from "react-toastify";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

const Cart = () => {
	const dispatch = useDispatch();
	const { carts, total: cartTotal, finalTotal, isClearingAll, updatingIds } = useSelector((state) => state.cart);

	// 刪除確認 Modal
	const deleteModalRef = useRef(null);
	const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'single' | 'all', cart?: object }

	const handleUpdateQty = async (cartId, newQty) => {
		const safeQty = Math.max(1, Number(newQty));
		if (isNaN(safeQty) || safeQty < 1) return;

		const cartItem = carts.find((item) => item.id === cartId);
		if (!cartItem || safeQty === cartItem.qty) return;

		// 保留原始數量，用於失敗時回滾
		const previousQty = cartItem.qty;

		// OptimisticUpdate UI
		dispatch(optimisticUpdateQty({ cartId, qty: safeQty }));

		try {
			await dispatch(updateCartItem({ cartId, productId: cartItem.product?.id, qty: safeQty })).unwrap();

			await dispatch(fetchCart()).unwrap();
			toast.success("成功更新數量！");
		} catch (message) {
			dispatch(optimisticUpdateQty({ cartId, qty: previousQty }));
			toast.error(`更新購物車數量失敗: ${message}`);
		}
	};

	const handleRemoveCart = async (cartId) => {
		if (updatingIds.includes(cartId)) return;

		try {
			const result = await dispatch(removeCartItem(cartId)).unwrap();
			toast.success(`產品已移除！${result.message || ""}`);
			// removeCartItem.fulfilled 已從本地 state 移除，再 fetchCart 同步 server 端總計
			dispatch(fetchCart());
		} catch (message) {
			toast.error(`刪除失敗：${message || "請稍後再試"}`);
		}
	};

	const handleRemoveAllCart = async () => {
		if (isClearingAll || carts.length === 0) return;

		try {
			const result = await dispatch(clearCart()).unwrap();
			toast.success(`購物車已清空！${result.message || ""}`);
		} catch (message) {
			toast.error(`清空購物車失敗：${message || "請稍後再試"}`);
			// 清空失敗時重新拉取還原
			dispatch(fetchCart());
		}
	};

	// 開啟刪除確認 Modal
	const openDeleteConfirm = (type, cart = null) => {
		setDeleteTarget({ type, cart });
		deleteModalRef.current?.show();
	};

	// 關閉 Modal
	const closeDeleteModal = () => {
		deleteModalRef.current?.hide();
		setDeleteTarget(null);
	};

	// 確認刪除
	const confirmDelete = () => {
		if (deleteTarget?.type === "single" && deleteTarget.cart) {
			handleRemoveCart(deleteTarget.cart.id);
		} else if (deleteTarget?.type === "all") {
			handleRemoveAllCart();
		}
		closeDeleteModal();
	};

	useEffect(() => {
		dispatch(fetchCart())
			.unwrap()
			.catch((msg) => toast.error(`取得購物車失敗: ${msg}`));
	}, [dispatch]);

	return (
		<>
			<h2 className="fs-4 fw-bold text-primary mb-4">購物車</h2>
			<div className="bg-white p-2 rounded-3">
				{carts.length === 0 ? (
					<h2 className="text-center mb-0 py-5 text-primary">目前購物車空空 `A'</h2>
				) : (
					<>
						<div className="mb-2">
							<button
								type="button"
								className="btn btn-sm btn-danger border-2 text-white d-flex align-items-center gap-1 ms-auto"
								style={{ whiteSpace: "nowrap" }}
								onClick={() => openDeleteConfirm("all")}
							>
								<span className="spinner-border spinner-border-sm d-none" aria-hidden="true"></span>刪除所有
							</button>
						</div>
						<div className="table-responsive ">
							<table className="table align-middle">
								<thead>
									<tr>
										<th scope="col"></th>
										<th scope="col">品名</th>
										<th scope="col">數量/單位</th>
										<th scope="col">小計</th>
										<th scope="col"></th>
									</tr>
								</thead>
								<tbody>
									{carts.map((cart) => (
										<tr key={cart.id}>
											<td style={{ width: "100px" }}>
												<img
													src={cart.product.imageUrl}
													style={{ width: "80px", height: "80px", objectFit: "cover" }}
													alt=""
												/>
											</td>
											<td style={{ whiteSpace: "nowrap" }}>
												<div>{cart.product?.title}</div>
												{cart.product?.flavor && cart.product.flavor.length > 0 && (
													<small className="text-muted">
														口味：{cart.product.flavor.join("、")}
													</small>
												)}
											</td>
											<td>
												<div className="d-flex align-items-center gap-2">
													<button
														type="button"
														className="cart-qty-btn"
														onClick={() => handleUpdateQty(cart.id, cart.qty - 1)}
														disabled={cart.qty <= 1 || updatingIds.includes(cart.id)}
													>
														−
													</button>

													<select
														className="cart-qty-select"
														value={cart.qty}
														onChange={(e) => handleUpdateQty(cart.id, Number(e.target.value))}
														disabled={updatingIds.includes(cart.id)}
													>
														{Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
															<option key={num} value={num}>
																{num}
															</option>
														))}
													</select>

													<button
														type="button"
														className="cart-qty-btn"
														onClick={() => handleUpdateQty(cart.id, cart.qty + 1)}
														disabled={cart.qty >= (cart.product.num || 99) || updatingIds.includes(cart.id)}
													>
														+
													</button>
												</div>
											</td>
											<td>{cart.final_total}</td>
											<td>
												<button
													type="button"
													className="btn btn-sm btn-danger border-2 text-white d-flex align-items-center gap-1"
													style={{ whiteSpace: "nowrap" }}
													onClick={() => openDeleteConfirm("single", cart)}
													disabled={updatingIds.includes(cart.id)}
												>
													<span
														className={`spinner-border spinner-border-sm ${updatingIds.includes(cart.id) ? "d-block" : "d-none"}`}
														aria-hidden="true"
													></span>
													{updatingIds.includes(cart.id) ? "刪除中..." : "刪除"}
												</button>
											</td>
										</tr>
									))}
								</tbody>
								<tfoot>
									<tr>
										<td colSpan={4} className="text-end">
											總數:
										</td>
										<td className="text-center">{cartTotal}</td>
									</tr>
									<tr>
										<td colSpan={4} className="text-end">
											折扣後:
										</td>
										<td className="text-center">{finalTotal}</td>
									</tr>
								</tfoot>
							</table>
						</div>

            <hr />
					</>
				)}
			</div>

			{/* 刪除確認 Modal */}
			<DeleteConfirmModal
				ref={deleteModalRef}
				tempProduct={{
					id: deleteTarget?.cart?.id || "all",
					title:
						deleteTarget?.type === "all"
							? "所有購物車商品"
							: deleteTarget?.cart?.product?.title,
				}}
				handleDeleteItem={confirmDelete}
				closeModal={closeDeleteModal}
			/>
		</>
	);
};

export default Cart;
