import React, { useEffect, useState } from "react";
import axios from "axios";

function UserList({ token, onUserClick }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => setUsers(response.data))
      .catch(error => console.error("Error fetching users", error));
  }, [token]);

  return (
    <div>
      <h3>Users</h3>
      <ul>
        {users.map(user => (
          <li key={user._id} onClick={() => onUserClick(user.username)}>
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
