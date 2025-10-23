import axiosInstance from 'axiosInstance';

const url = '/api/User/';

export const login = async (credentials) => {
	const response = await axiosInstance.post(`${url}/login`, credentials);
	return response.data;
}
export const register = async (userInfo) => {
	const response = await axiosInstance.post(`${url}/register`, userInfo);
	return response.data;
}
export const logout = async () => {
	const response = await axiosInstance.post(`${url}/logout`);
	return response.data;
}
export const refreshToken = async () => {
	const response = await axiosInstance.post(`${url}/refresh-token`);
	return response.data;
}