import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { fetchAdminProducts, saveProduct, deleteAdminProduct } from "@/store/adminProductsSlice";
import { logout } from "@/store/authSlice";

import ProductTable from "@/components/Admin/ProductTable.jsx";
import Pagination from "@/components/Admin/Pagination.jsx";
import ProductFormModal from "@/components/Admin/ProductFormModal.jsx";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.jsx";
import AdminHeader from "@/components/Admin/AdminHeader.jsx";
import { toast } from "react-toastify";

const Dashboard = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// 從 Redux store 讀取管理員產品資料
	const { products: adminProducts, pagination, currentPage } = useSelector((state) => state.adminProducts);

	const [tempProduct, setTempProduct] = useState(null);

	// Modal refs
	const adminModalRef = useRef(null);
	const deleteModalRef = useRef(null);

	// ────────────────────────────────────────────────
	//  Modal 操作
	// ────────────────────────────────────────────────
	const openModal = (type, item = null) => {
		if (type === "edit") {
			setTempProduct({ ...item });
			adminModalRef.current?.show();
		} else if (type === "newItem") {
			setTempProduct({
				category: "",
				subcategory: "",
				content: "",
				description: "",
				origin_price: 1,
				price: 1,
				title: "",
				unit: "",
				num: 1,
				imageUrl: "https://placehold.co/600x400?text=No+Image",
				imagesUrl: [],
				is_enabled: 1,
				label: [],
			});
			adminModalRef.current?.show();
		} else if (type === "delete") {
			setTempProduct(item);
			deleteModalRef.current?.show();
		}
	};

	const closeModal = (type) => {
		if (type === "edit" || type === "newItem") {
			adminModalRef.current?.hide();
		} else if (type === "delete") {
			deleteModalRef.current?.hide();
		}
		setTempProduct(null);
	};

	// ────────────────────────────────────────────────
	//  CRUD 操作
	// ────────────────────────────────────────────────
	const handleSaveProduct = async (data) => {
		try {
			const result = await dispatch(saveProduct(data)).unwrap();
			toast.success(`${result.message}` || "操作成功");
			closeModal(data.id ? "edit" : "newItem");
			await dispatch(fetchAdminProducts(currentPage)).unwrap();
		} catch (error) {
			toast.error(`${error || "操作失敗"}`);
		}
	};

	const getAdminProducts = async (page = 1) => {
		try {
			await dispatch(fetchAdminProducts(page)).unwrap();
		} catch (error) {
			toast.error(`取得管理員產品列表失敗: ${error}`);
		}
	};

	const handleDeleteItem = async (id) => {
		try {
			const result = await dispatch(deleteAdminProduct(id)).unwrap();
			toast.success(`${result.message}` || "成功刪除產品!");
			await dispatch(fetchAdminProducts(currentPage)).unwrap();
		} catch (error) {
			toast.error(`刪除產品失敗: ${error}`);
		}
	};

	const handleLogout = async () => {
		try {
			await dispatch(logout()).unwrap();
			toast.success("登出成功");
		} catch (error) {
			toast.error(`登出失敗: ${error}`);
		}
		navigate("/", { replace: true });
	};

	useEffect(() => {
		dispatch(fetchAdminProducts(1));
	}, [dispatch]);

	return (
		<>
			<AdminHeader handleLogout={handleLogout} openModal={openModal} />

			<ProductTable adminProducts={adminProducts} openModal={openModal} />
			{pagination.total_pages > 1 && (
				<Pagination pagination={pagination} currentPage={currentPage} getAdminProducts={getAdminProducts} />
			)}

			{/* Modal */}
			<ProductFormModal
				ref={adminModalRef}
				tempProduct={tempProduct}
				onSave={handleSaveProduct}
				closeModal={() => closeModal(tempProduct?.id ? "edit" : "newItem")}
			/>

			<DeleteConfirmModal
				ref={deleteModalRef}
				tempProduct={tempProduct}
				handleDeleteItem={handleDeleteItem}
				closeModal={() => closeModal("delete")}
			/>
		</>
	);
};

export default Dashboard;
