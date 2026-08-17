import api from "./api";

export const searchUsers = async (search) => {
  const response = await api.get(
    `/users/search?search=${encodeURIComponent(search)}`
  );

  return response.data.users;
};