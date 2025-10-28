import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
};

const sizeClasses = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-lg',
  xl: 'w-full max-w-xl',
};

/**
 * Reusable modal component built on Radix Dialog.
 * Provides consistent styling and behavior for all modals in the app.
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Confirm Action"
 *   description="Are you sure you want to continue?"
 * >
 *   <div className="p-6">
 *     <Button onClick={handleConfirm}>Confirm</Button>
 *   </div>
 * </Modal>
 * ```
 */
export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  className = '',
  contentClassName = '',
  overlayClassName = '',
}: ModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={clsx(
            'fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl',
            overlayClassName
          )}
        />
        <Dialog.Content
          className={clsx(
            'fixed inset-0 z-50 flex items-center justify-center px-6 py-12',
            className
          )}
        >
          <div
            className={clsx(
              'relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900',
              sizeClasses[size],
              contentClassName
            )}
          >
            {showCloseButton && (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute right-5 top-5 z-10 text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            {title && (
              <Dialog.Title className="text-white">
                {title}
              </Dialog.Title>
            )}
            {description && (
              <Dialog.Description className="text-white/70">
                {description}
              </Dialog.Description>
            )}
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
