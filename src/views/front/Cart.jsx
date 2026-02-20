import { useEffect, useRef, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  optimisticUpdateQty,
} from "@/store/cartSlice";
import {
  createOrder,
  fetchOrder,
  payOrder,
  clearCurrentOrder,
  clearLastOrderId,
} from "@/store/orderSlice";
import { toast } from "react-toastify";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import "@/styles/Cart.css";

// ===== 步驟常數 =====
const STEP_CART = 0;
const STEP_CHECKOUT = 1;
const STEP_PAYMENT = 2;

const STEPS = [
  { label: "購物車", icon: "🛒" },
  { label: "填寫資料", icon: "📝" },
  { label: "確認付款", icon: "💳" },
];

// ===== 步驟指示器元件 =====
const CheckoutSteps = ({ currentStep }) => (
  <div className="checkout-steps">
    {STEPS.map((step, index) => (
      <div key={step.label} className="d-flex align-items-center">
        <div
          className={`checkout-step ${
            index === currentStep
              ? "active"
              : index < currentStep
                ? "completed"
                : ""
          }`}
        >
          <span className="checkout-step-number">
            {index < currentStep ? "✓" : index + 1}
          </span>
          <span className="checkout-step-label">{step.label}</span>
        </div>
        {index < STEPS.length - 1 && (
          <div
            className={`checkout-step-divider ${index < currentStep ? "completed" : ""}`}
          />
        )}
      </div>
    ))}
  </div>
);

// ===== 購物車摘要元件 (結帳 / 付款步驟用) =====
const CartSummary = ({ carts, finalTotal }) => (
  <div className="cart-summary">
    <div className="cart-summary-title">🛍️ 購物車摘要</div>
    {carts.map((cart) => (
      <div key={cart.id} className="cart-summary-item">
        <span>
          {cart.product?.title} × {cart.qty}
        </span>
        <span>NT$ {cart.final_total}</span>
      </div>
    ))}
    <div className="cart-summary-total">
      <span>合計</span>
      <span>NT$ {finalTotal}</span>
    </div>
  </div>
);

// ===== 結帳表單元件 =====
const CheckoutForm = ({
  carts,
  finalTotal,
  onBack,
  onSubmitOrder,
  isCreating,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      tel: "",
      address: "",
      message: "",
    },
  });

  const onSubmit = (data) => {
    const orderData = {
      user: {
        name: data.name,
        email: data.email,
        tel: data.tel,
        address: data.address,
      },
      message: data.message,
    };
    onSubmitOrder(orderData);
  };

  return (
    <div className="checkout-form-wrapper">
      <CartSummary carts={carts} finalTotal={finalTotal} />

      <div className="checkout-form-card">
        <div className="checkout-form-title">📋 收件人資訊</div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="checkout-form-group">
            <label htmlFor="customName">
              姓名 <span className="required">*</span>
            </label>
            <input
              id="customName"
              type="text"
              placeholder="請輸入收件人姓名"
              className={errors.name ? "is-invalid" : ""}
              {...register("name", { required: "姓名為必填欄位" })}
            />
            {errors.name && (
              <div className="checkout-form-error">{errors.name.message}</div>
            )}
          </div>

          <div className="checkout-form-group">
            <label htmlFor="customMail">
              Email <span className="required">*</span>
            </label>
            <input 
              id="customMail"
              type="email"
              placeholder="請輸入 Email"
              className={errors.email ? "is-invalid" : ""}
              {...register("email", {
                required: "Email 為必填欄位",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email 格式不正確",
                },
              })}
            />
            {errors.email && (
              <div className="checkout-form-error">{errors.email.message}</div>
            )}
          </div>

          <div className="checkout-form-group">
            <label htmlFor="customTel">
              電話 <span className="required">*</span>
            </label>
            <input
              id="customTel" 
              type="tel"
              placeholder="請輸入聯絡電話"
              className={errors.tel ? "is-invalid" : ""}
              {...register("tel", {
                required: "電話為必填欄位",
                pattern: {
                  value: /^[0-9]{8,12}$/,
                  message: "請輸入有效的電話號碼（8-12 位數字）",
                },
              })}
            />
            {errors.tel && (
              <div className="checkout-form-error">{errors.tel.message}</div>
            )}
          </div>

          <div className="checkout-form-group">
            <label htmlFor="customAddress">
              地址 <span className="required">*</span>
            </label>
            <input
              id="customAddress"
              type="text"
              placeholder="請輸入收件地址"
              className={errors.address ? "is-invalid" : ""}
              {...register("address", { required: "地址為必填欄位" })}
            />
            {errors.address && (
              <div className="checkout-form-error">
                {errors.address.message}
              </div>
            )}
          </div>

          <div className="checkout-form-group">
            <label htmlFor="customComment">留言</label>
            <textarea
              id="customComment"
              placeholder="有什麼想告訴我們的嗎？（選填）"
              rows={3}
              {...register("message")}
            />
          </div>

          <div className="checkout-form-actions">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onBack}
            >
              ← 返回購物車
            </button>
            <button
              type="submit"
              className="btn btn-primary text-white"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    aria-hidden="true"
                  />
                  建立訂單中...
                </>
              ) : (
                "送出訂單 →"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== 付款頁面元件 =====
const PaymentView = ({ order, isPaying, onPay, onBackToCart }) => {
  // order.products 可能是 object (key-value) 或 array
  const productList = useMemo(() => {
    if (!order?.products) return [];
    if (Array.isArray(order.products)) return order.products;
    return Object.values(order.products);
  }, [order]);

  if (!order) {
    return (
      <div className="payment-wrapper text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
        <p className="mt-3 text-muted">正在載入訂單資訊...</p>
      </div>
    );
  }

  return (
    <div className="payment-wrapper">
      <div className="payment-card">
        {/* 標題 */}
        <div className="payment-header">
          {order.is_paid ? (
            <>
              <div className="payment-success-icon">✓</div>
              <h3>付款完成！</h3>
            </>
          ) : (
            <h3>📋 訂單確認與付款</h3>
          )}
          <div className="payment-order-id">訂單編號：{order.id}</div>
        </div>

        {/* 商品列表 */}
        <div className="payment-summary">
          <div className="payment-summary-title">🛍️ 訂單商品</div>
          {productList.map((item) => (
            <div key={item.id} className="payment-product-item">
              <div>
                <div className="payment-product-name">
                  {item.product?.title || "商品"}
                </div>
                <div className="payment-product-qty">× {item.qty}</div>
              </div>
              <div className="payment-product-price">
                NT$ {item.final_total || item.total}
              </div>
            </div>
          ))}
        </div>

        {/* 收件人資訊 */}
        {order.user && (
          <div className="payment-user-info">
            <div className="payment-user-info-title">👤 收件人資訊</div>
            <div className="payment-user-row">
              <span className="payment-user-label">姓名</span>
              <span className="payment-user-value">{order.user.name}</span>
            </div>
            <div className="payment-user-row">
              <span className="payment-user-label">Email</span>
              <span className="payment-user-value">{order.user.email}</span>
            </div>
            <div className="payment-user-row">
              <span className="payment-user-label">電話</span>
              <span className="payment-user-value">{order.user.tel}</span>
            </div>
            <div className="payment-user-row">
              <span className="payment-user-label">地址</span>
              <span className="payment-user-value">{order.user.address}</span>
            </div>
          </div>
        )}

        {/* 留言 */}
        {order.message && (
          <div className="payment-user-info mb-3">
            <div className="payment-user-info-title">💬 訂單留言</div>
            <p
              className="mb-0"
              style={{ fontSize: "0.9rem", color: "#78350f" }}
            >
              {order.message}
            </p>
          </div>
        )}

        {/* 總金額 */}
        <div className="payment-total-row">
          <span className="payment-total-label">訂單總金額</span>
          <span className="payment-total-amount">NT$ {order.total}</span>
        </div>

        {/* 付款狀態 */}
        <div className={`payment-status ${order.is_paid ? "paid" : "unpaid"}`}>
          {order.is_paid
            ? `✓ 已付款${order.paid_date ? `（${new Date(order.paid_date * 1000).toLocaleString("zh-TW")}）` : ""}`
            : "尚未付款"}
        </div>

        {/* 操作按鈕 */}
        <div className="payment-actions">
          {!order.is_paid && (
            <button
              type="button"
              className="btn-pay"
              disabled={isPaying}
              onClick={onPay}
            >
              {isPaying ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    aria-hidden="true"
                  />
                  付款處理中...
                </>
              ) : (
                <>💳 確認付款</>
              )}
            </button>
          )}
          <button
            type="button"
            className="btn-back-cart"
            onClick={onBackToCart}
          >
            {order.is_paid ? "🏠 繼續購物" : "← 返回購物車"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== 主元件 =====
const Cart = () => {
  const dispatch = useDispatch();
  const {
    carts,
    total: cartTotal,
    finalTotal,
    isClearingAll,
    updatingIds,
  } = useSelector((state) => state.cart);
  const { currentOrder, isCreating, isPaying, lastOrderId } = useSelector(
    (state) => state.order,
  );

  // 根據 Redux 狀態決定初始步驟：若有未付款訂單，直接進入付款頁
  const getInitialStep = () => {
    if (currentOrder && !currentOrder.is_paid) return STEP_PAYMENT;
    if (lastOrderId && !currentOrder) return STEP_PAYMENT; // 有 orderId 但尚未載入訂單
    return STEP_CART;
  };

  const [step, setStep] = useState(getInitialStep);

  // 若有 lastOrderId 但 currentOrder 尚未載入（例如離開後重新進入），自動恢復訂單
  useEffect(() => {
    if (lastOrderId && !currentOrder) {
      dispatch(fetchOrder(lastOrderId))
        .unwrap()
        .then(() => setStep(STEP_PAYMENT))
        .catch(() => {
          // 訂單載入失敗，回到購物車
          dispatch(clearLastOrderId());
          setStep(STEP_CART);
        });
    }
  }, [lastOrderId, currentOrder, dispatch]);

  // 刪除確認 Modal
  const deleteModalRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ===== 購物車操作 =====
  const handleUpdateQty = async (cartId, newQty) => {
    const safeQty = Math.max(1, Number(newQty));
    if (isNaN(safeQty) || safeQty < 1) return;

    const cartItem = carts.find((item) => item.id === cartId);
    if (!cartItem || safeQty === cartItem.qty) return;

    const previousQty = cartItem.qty;
    dispatch(optimisticUpdateQty({ cartId, qty: safeQty }));

    try {
      await dispatch(
        updateCartItem({
          cartId,
          productId: cartItem.product?.id,
          qty: safeQty,
        }),
      ).unwrap();

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
      dispatch(fetchCart());
    }
  };

  // ===== 刪除確認 Modal =====
  const openDeleteConfirm = (type, cart = null) => {
    setDeleteTarget({ type, cart });
    deleteModalRef.current?.show();
  };

  const closeDeleteModal = () => {
    deleteModalRef.current?.hide();
    setDeleteTarget(null);
  };

  const confirmDelete = () => {
    if (deleteTarget?.type === "single" && deleteTarget.cart) {
      handleRemoveCart(deleteTarget.cart.id);
    } else if (deleteTarget?.type === "all") {
      handleRemoveAllCart();
    }
    closeDeleteModal();
  };

  // ===== 結帳流程 =====
  const handleGoCheckout = () => {
    if (carts.length === 0) {
      toast.warning("購物車是空的，請先加入商品！");
      return;
    }
    setStep(STEP_CHECKOUT);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitOrder = async (orderData) => {
    try {
      const result = await dispatch(createOrder(orderData)).unwrap();
      toast.success(result.message || "訂單已建立！");

      // 建立成功後拉取訂單詳情 & 清空購物車狀態
      await dispatch(fetchOrder(result.orderId)).unwrap();
      await dispatch(fetchCart()).unwrap();

      setStep(STEP_PAYMENT);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (message) {
      toast.error(`建立訂單失敗：${message}`);
    }
  };

  // ===== 付款 =====
  const handlePay = async () => {
    const orderId = currentOrder?.id || lastOrderId;
    if (!orderId) return;

    try {
      const result = await dispatch(payOrder(orderId)).unwrap();
      toast.success(result.message || "付款完成！");
      // 重新取得訂單以更新付款狀態
      await dispatch(fetchOrder(orderId)).unwrap();
    } catch (message) {
      toast.error(`付款失敗：${message}`);
    }
  };

  const handleBackToCart = () => {
    // 已付款 → 清除訂單資料，回到乾淨的購物車
    // 未付款 → 保留訂單資料，使用者離開後回來還能繼續付款
    if (currentOrder?.is_paid) {
      dispatch(clearCurrentOrder());
      dispatch(clearLastOrderId());
    }
    setStep(STEP_CART);
    dispatch(fetchCart());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 初始載入購物車
  useEffect(() => {
    dispatch(fetchCart())
      .unwrap()
      .catch((msg) => toast.error(`取得購物車失敗: ${msg}`));
  }, [dispatch]);

  return (
    <>
      {/* 步驟指示器 */}
      <CheckoutSteps currentStep={step} />

      {/* ===== Step 0: 購物車 ===== */}
      {step === STEP_CART && (
        <>
          <h2 className="fs-4 fw-bold text-primary mb-4">🛒 購物車</h2>
          <div className="bg-white p-2 rounded-3">
            {carts.length === 0 ? (
              <h2 className="text-center mb-0 py-5 text-primary">
                目前購物車空空 `A&apos;
              </h2>
            ) : (
              <>
                <div className="mb-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-danger border-2 text-white d-flex align-items-center gap-1 ms-auto"
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => openDeleteConfirm("all")}
                  >
                    <span
                      className="spinner-border spinner-border-sm d-none"
                      aria-hidden="true"
                    ></span>
                    刪除所有
                  </button>
                </div>
                <div className="table-responsive">
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
                              style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                              }}
                              alt=""
                            />
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <div>{cart.product?.title}</div>
                            {cart.product?.flavor &&
                              cart.product.flavor.length > 0 && (
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
                                onClick={() =>
                                  handleUpdateQty(cart.id, cart.qty - 1)
                                }
                                disabled={
                                  cart.qty <= 1 || updatingIds.includes(cart.id)
                                }
                              >
                                −
                              </button>

                              <select
                                className="cart-qty-select"
                                value={cart.qty}
                                onChange={(e) =>
                                  handleUpdateQty(
                                    cart.id,
                                    Number(e.target.value),
                                  )
                                }
                                disabled={updatingIds.includes(cart.id)}
                              >
                                {Array.from(
                                  { length: 20 },
                                  (_, i) => i + 1,
                                ).map((num) => (
                                  <option key={num} value={num}>
                                    {num}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                className="cart-qty-btn"
                                onClick={() =>
                                  handleUpdateQty(cart.id, cart.qty + 1)
                                }
                                disabled={
                                  cart.qty >= (cart.product.num || 99) ||
                                  updatingIds.includes(cart.id)
                                }
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
                              {updatingIds.includes(cart.id)
                                ? "刪除中..."
                                : "刪除"}
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

                {/* 前往結帳按鈕 */}
                <div className="d-flex justify-content-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary text-white px-4 py-2 fw-bold"
                    onClick={handleGoCheckout}
                  >
                    前往結帳 →
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ===== Step 1: 填寫結帳資料 ===== */}
      {step === STEP_CHECKOUT && (
        <CheckoutForm
          carts={carts}
          finalTotal={finalTotal}
          onBack={() => {
            setStep(STEP_CART);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onSubmitOrder={handleSubmitOrder}
          isCreating={isCreating}
        />
      )}

      {/* ===== Step 2: 付款 ===== */}
      {step === STEP_PAYMENT && (
        <PaymentView
          order={currentOrder}
          isPaying={isPaying}
          onPay={handlePay}
          onBackToCart={handleBackToCart}
        />
      )}

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
