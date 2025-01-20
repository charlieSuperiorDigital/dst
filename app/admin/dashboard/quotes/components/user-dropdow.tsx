//get user list
"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserList, User } from "@/utils/client-side-api";
import { useEffect, useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function UserDropdown({ onChange, value }: Props) {
  const [users, SetUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getUserList("", 1, 100);
      console.log(response.users);
      SetUsers(response.users);
    };
    fetchUsers();
  }, []);

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className=" w-[180px]">
        <SelectValue placeholder="Select a User" />
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.fullName}>
            {user.fullName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
