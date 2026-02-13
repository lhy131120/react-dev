// components/DeleteConfirmModal.jsx
import { forwardRef, useImperativeHandle, useState } from "react";

const DeleteConfirmModal = forwardRef(({ tempProduct, handleDeleteItem, closeModal }, ref) => {
	const [showModal, setShowModal] = useState(false);

	useImperativeHandle(ref, () => ({
		show: () => {
			setShowModal(true);
			document.body.classList.add("modal-open");
		},
		hide: () => {
			setShowModal(false);
			document.body.classList.remove("modal-open");
		},
	}));

	const onDelete = () => {
		if (tempProduct?.id) {
			handleDeleteItem(tempProduct.id);
		}
		closeModal?.();
	};

	if (!showModal) return null;

	return (
		<>
			{/* 解決bootstrap 和react的沖突 Backdrop - 必須先渲染 */}
			<div className="modal-backdrop fade show" onClick={closeModal} />
			
			{/* Modal */}
			<div className="modal fade show d-block" tabIndex="-1" style={{ display: "block" }}>
				<div className="modal-dialog modal-dialog-centered modal-md">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">刪除確認</h5>
							<button type="button" className="btn-close" onClick={closeModal} />
						</div>
						<div className="modal-body">
							<p className="mb-0">
								確定要刪除 <strong>{tempProduct?.title || "此產品"}</strong> 嗎？
							</p>
						</div>
						<div className="modal-footer justify-content-center">
							<button type="button" className="btn btn-secondary" onClick={closeModal}>
								取消
							</button>
							<button type="button" className="btn btn-danger" onClick={onDelete}>
								刪除
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
});

export default DeleteConfirmModal;
