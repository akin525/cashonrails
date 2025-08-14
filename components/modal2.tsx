type ModalProps = {
    open: boolean;
    setClose: React.Dispatch<React.SetStateAction<boolean>>;
    onClosed?: () => void;
    children: React.ReactNode;
}

export default function Modal({ children, open, setClose, onClosed }: ModalProps) {

    // Handle close modal
    const handleCloseModal = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.dataset.target === "closeModalTarget") {
            // Close modal
            setClose(false);
            onClosed && onClosed();
        }
    }

    return (
        <>
            {
                open && (
                    <section data-target="closeModalTarget" onClick={handleCloseModal} className="w-full h-screen fixed top-0 left-0 z-30 bg-[#00000099] flex justify-center items-center">
                        <div className="bg-white rounded-lg p-6">
                            {children}
                        </div>
                    </section>
                )
            }
        </>
    )
}