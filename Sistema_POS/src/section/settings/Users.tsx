import { useEffect, useState } from "react"
import { deleteUser, getUsers } from "../../api/admin/login";
import { UserLoginProps } from "../../types/types";
import { Delete, Edit } from "../../icons/icons";
import ModalChangeUsers from "./ModalChangeUsers";
import { decryptName, encryptName } from "../../utils/function";
import { showToast } from "../../components/Toast";

export default function Users() {
  const [users, setUsers] = useState<UserLoginProps[]>([]);
  const [currentUser, setCurrentUser] = useState<UserLoginProps>()
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const userId = decryptName(localStorage.getItem('userId'));

  async function loadUsers() {
    const { data } = await getUsers();
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, [])

  function handleUser(user: UserLoginProps) {
    setCurrentUser(user)
    setIsShowModal(true)
  }

  async function handleDeleteUser(user: UserLoginProps) {
    const tokenId = localStorage.getItem(encryptName("tokenUser"));

    const data = {
      token: tokenId,
      is_active: false
    }

    const { success, error } = await deleteUser(user.id, data);

    if (success) {
      showToast("Usuario eliminado exitosamente", true);
      loadUsers()
    } else {
      showToast(error.message, false);
    }

  }

  return (
    <>
      <h2 className="text-xl mb-5 font-bold text-secondary">Listado de usuarios</h2>
      <div className="relative overflow-y-auto h-full rounded-md border overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs border-b text-gray-700 uppercase bg-whiting2">
            <tr>
              <th scope="col" className="px-4 py-3">
                Usuario
              </th>
              <th scope="col" className="px-2 py-3">
                Correo
              </th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {users.filter((user) => user.id !== userId).map((user, index) => (
              <tr key={index} className={`bg-white`}>
                <th scope="row" className="px-4 py-4 font-medium text-primary whitespace-nowrap">
                  {user.username}
                </th>
                <td className="px-2 py-4 text-secondary font-medium">
                  {user.email}
                </td>
                <td className="px-2">
                  <button onClick={() => handleUser(user)} className="hover:bg-whiting2 flex items-center py-1 rounded-md justify-center w-10">
                    <Edit />
                  </button>
                </td>
                <td className="px-2">
                  <button onClick={() => handleDeleteUser(user)} className="hover:bg-whiting2 flex items-center py-1 rounded-md justify-center w-10">
                    <Delete className="size-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isShowModal && <ModalChangeUsers onApply={loadUsers} onClose={() => setIsShowModal(false)} user={currentUser} />}
    </>
  )
}
