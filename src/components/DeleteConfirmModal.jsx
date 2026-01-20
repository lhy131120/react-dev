// components/DeleteConfirmModal.jsx
import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Modal } from "bootstrap";

const DeleteConfirmModal = forwardRef(({ tempProduct, handleDeleteItem, onClose }, ref) => {
	const modalEl = useRef(null);
	const modalInstance = useRef(null);

	useEffect(() => {
		if (!modalEl.current) return;

		modalInstance.current = new Modal(modalEl.current, {
			keyboard: true,
			backdrop: true,
		});

		return () => modalInstance.current?.dispose();
	}, []);

	useImperativeHandle(ref, () => ({
		show: () => modalInstance.current?.show(),
		hide: () => modalInstance.current?.hide(),
	}));

	const onDelete = () => {
		if (tempProduct?.id) {
			handleDeleteItem(tempProduct.id);
		}
		onClose?.();
	};

	return (
		<div className="modal fade" ref={modalEl} tabIndex="-1">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">刪除確認</h5>
						<button type="button" className="btn-close" onClick={onClose} />
					</div>
					<div className="modal-body">
						<p className="mb-0">
							確定要刪除 <strong>{tempProduct?.title || "此產品"}</strong> 嗎？
						</p>
					</div>
					<div className="modal-footer justify-content-center">
						<button type="button" className="btn btn-secondary" onClick={onClose}>
							取消
						</button>
						<button type="button" className="btn btn-danger" onClick={onDelete}>
							刪除
						</button>
					</div>
				</div>
			</div>
		</div>
	);
});

export default DeleteConfirmModal;
