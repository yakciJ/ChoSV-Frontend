import axiosInstance from "./axiosInstance";

const url = "/api/Report";

export const sendReport = async (reportData) => {
    const response = await axiosInstance.post(url, reportData);
    return response;
};

export const REPORT_TYPES = {
    USER: "User",
    PRODUCT: "Product",
    COMMENT: "Comment",
};

// Get all reports with pagination and filter
export const getAllReports = async (page = 1, pageSize = 10, status = "") => {
    try {
        const params = { page, pageSize };
        if (status) {
            params.status = status;
        }

        const response = await axiosInstance.get(url, { params });
        return response;
    } catch (error) {
        console.error("Error fetching reports:", error);
        throw error;
    }
};

// Update report status
export const updateReportStatus = async (reportId, status) => {
    try {
        const response = await axiosInstance.put(url, {
            reportId,
            status,
        });
        return response;
    } catch (error) {
        console.error("Error updating report status:", error);
        throw error;
    }
};

// Delete report
export const deleteReport = async (reportId) => {
    try {
        const response = await axiosInstance.delete(`${url}/${reportId}`);
        return response;
    } catch (error) {
        console.error("Error deleting report:", error);
        throw error;
    }
};
