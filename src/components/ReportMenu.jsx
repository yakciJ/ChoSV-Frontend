import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Flag } from "lucide-react";
import ReportDialog from "./ReportDialog";

const ReportMenu = ({
    entityId,
    entityType,
    onReportSuccess,
    className = "",
    additionalMenuItems = [], // Array of {label, onClick, icon} objects
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [isMenuOpen]);

    // Don't render if user is not logged in

    const handleReportClick = () => {
        setIsMenuOpen(false);
        setIsReportDialogOpen(true);
    };

    const handleReportSuccess = () => {
        if (onReportSuccess) {
            onReportSuccess();
        }
    };

    return (
        <div className={`relative ${className}`} ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="More options"
            >
                <MoreVertical className="w-5 h-5" />
            </button>

            {isMenuOpen && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                    {additionalMenuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setIsMenuOpen(false);
                                item.onClick();
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                            {item.icon && (
                                <span className="mr-2">{item.icon}</span>
                            )}
                            {item.label}
                        </button>
                    ))}

                    {additionalMenuItems.length > 0 && (
                        <div className="border-t border-gray-200 my-1"></div>
                    )}

                    <button
                        onClick={handleReportClick}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                        <Flag className="w-4 h-4 mr-2" />
                        Báo cáo
                    </button>
                </div>
            )}

            <ReportDialog
                isOpen={isReportDialogOpen}
                onClose={() => setIsReportDialogOpen(false)}
                entityId={entityId}
                entityType={entityType}
                onReportSuccess={handleReportSuccess}
            />
        </div>
    );
};

export default ReportMenu;
