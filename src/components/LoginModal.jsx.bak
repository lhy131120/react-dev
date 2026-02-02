import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Modal } from "bootstrap";

const LoginModal = forwardRef(({ loginData, handleInputChange, handleSubmit, onClose }, ref) => {
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

  

	return (
		<div className="modal fade" ref={modalEl} tabIndex="-1">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">登入</h5>
						<button type="button" className="btn-close" onClick={onClose} />
					</div>
					<div className="modal-body">
						<form onSubmit={handleSubmit}>
							<div className="mb-3">
								<label htmlFor="username" className="form-label">
									登入電郵
								</label>
								<input
									type="email"
									className="form-control"
									id="username"
									name="username"
									placeholder="請輸入用戶名"
									value={loginData.username}
									onChange={handleInputChange}
									required
								/>
							</div>
							<div className="mb-3">
								<label htmlFor="password" className="form-label">
									密碼
								</label>
								<input
									type="password"
									className="form-control"
									id="password"
									name="password"
									placeholder="請輸入密碼"
									value={loginData.password}
									onChange={handleInputChange}
									required
								/>
							</div>
							<button type="submit" className="btn btn-primary w-100 py-2 mt-3">
								登入
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
});

export default LoginModal;
