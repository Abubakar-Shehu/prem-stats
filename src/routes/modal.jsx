/* eslint-disable react/prop-types */
import close from '../styles/close-square-svgrepo-com.svg'
import "../styles/Modal.css"

export const Modal = ({onClose }) => {
  return (
    <div className="photo-details-modal">
      <button className="photo-details-modal__close-button" onClick={onClose}>
        <img src={close} alt="close symbol" />
      </button>
    </div>
  )
};
