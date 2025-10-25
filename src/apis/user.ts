import axios from "@/lib/axiosInstance";
import { User } from "@/types/user";

export async function getUsers(
  page = 1,
  limit = 10
): Promise<{ data: User[]; total: number }> {
  const skip = (page - 1) * limit;

  const res = await axios.get(`https://dummyjson.com/users?limit=${limit}&skip=${skip}`);

  const { users, total } = res.data;

 
  return { data: users, total };
}
