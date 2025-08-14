"use client";
import { CloseIcon } from "@/assets/icons";
import { PlusIcon } from "@/public/assets/icons";
import Buttons from "@/components/buttons";
import FormInputs, { FormCheckbox, FormSelect } from "@/components/formInputs/formInputs";
import Modal from "@/components/modal";
import { useAuth } from "@/contexts/authContext";
import axiosInstance, { handleAxiosError } from "@/helpers/axiosInstance";
import toast from "react-hot-toast";
import { ROLES_ENUMS } from "@/types";
import React, { useState } from "react";
import { ClipboardIcon } from "lucide-react";

const ROLE_OPTIONS = [
    { label: "Member", value: ROLES_ENUMS.member },
    { label: "Head", value: ROLES_ENUMS.head },
    { label: "Executive", value: ROLES_ENUMS.executive },
];

const Header = () => {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [username, setUsername] = useState("");
    const [selectedRole, setSelectedRole] = useState<ROLES_ENUMS | "">("");
    const [departments, setDepartments] = useState([
        { name: "operations", isSelected: false, value: 1 },
        { name: "compliance", isSelected: false, value: 2 },
        { name: "finance", isSelected: false, value: 3 },
        { name: "growth", isSelected: false, value: 4 },
    ]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { authState } = useAuth();

    const handleDepartmentChange = (name: string, value: boolean) => {
        setDepartments((prev) =>
            prev.map((d) => (d.name === name ? { ...d, isSelected: value } : d))
        );
    };

    const handleAddMember = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await axiosInstance.post(
                "/create-admin1",
                {
                    username: username,
                    email: newMemberEmail,
                    name: selectedTeam,
                    role: "admin",
                    departments: departments
                        .filter((department) => department.isSelected)
                        .map((d) => d.value),
                    password,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                    },
                }
            );

            if (response.data.status) {
                toast.success(response.data.message);
                setSuccess(response.data.message);
                setShowModal(false);
            } else {
                toast.error(response.data.message || "Something went wrong adding user");
                setError(response.data.message);
            }
        } catch (error) {
            handleAxiosError(error, (message) =>
                setError(message || "Something went wrong")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCopyDetails = () => {
        const roleLabel = ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label || "N/A";
        const selectedDepartments = departments
            .filter((d) => d.isSelected)
            .map((d) => d.name)
            .join(", ");

        const details = `
        Username: ${username}
        Email: ${newMemberEmail}
        Admin Name: ${selectedTeam}
        Password: ${password}
        Role: ${roleLabel}
        Departments: ${selectedDepartments}
        `;

        navigator.clipboard.writeText(details.trim()).then(() => {
            toast.success("Admin details copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy details.");
        });
    };

    return (
        <header className="flex items-center justify-between p-4 border-b border-bar min-h-auto relative flex-wrap gap-2">
            <div className="flex gap-5 items-center flex-1 max-w-xl justify-between">
                <h1 className="md:text-lg font-medium">Teams</h1>
                <div className="flex-1 max-w-[300px]">
                    <form>
                        <FormInputs
                            leadingItem={
                                <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
                                    <path
                                        d="M6.22869 12.2814C3.16827 12.2814 0.676605 9.78975 0.676605 6.72933C0.676605 3.66891 3.16827 1.17725 6.22869 1.17725C9.28911 1.17725 11.7808 3.66891 11.7808 6.72933C11.7808 9.78975 9.28911 12.2814 6.22869 12.2814Z"
                                        fill="black"
                                        fillOpacity="0.6"
                                    />
                                </svg>
                            }
                            label=""
                            name="search"
                            placeholder="Search"
                            className="max-w-[300px]"
                            defaultValue={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                </div>
            </div>

            <nav className="flex items-center space-x-3">
                <button onClick={() => setShowModal(true)} className="bg-[#01AB79] border-[#01AB79] border flex items-center font-medium text-sm py-2 px-4 rounded-md text-white">
                    <PlusIcon stroke="white" /> Create Admin
                </button>
            </nav>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-xl font-semibold">Add New Admin</p>
                        <button onClick={() => setShowModal(false)}>
                            <CloseIcon />
                        </button>
                    </div>

                    {error && <p className="text-red-500">{error}</p>}
                    {success && <p className="text-green-500">{success}</p>}

                    <div className="space-y-4 mt-7">
                        <FormInputs label="Email" name="email" placeholder="Enter email" className="max-w-[300px]"
                                    defaultValue={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)}/>
                        <FormInputs label="Admin Name" name="team" placeholder="Enter team name"
                                    className="max-w-[300px]" defaultValue={selectedTeam}
                                    onChange={(e) => setSelectedTeam(e.target.value)}/>
                        <FormInputs label="Username Name" name="username" placeholder="Enter team username"
                                    className="max-w-[300px]" defaultValue={username}
                                    onChange={(e) => setUsername(e.target.value)}/>
                        <FormInputs label="Admin Password" name="password" placeholder="Enter admin password"
                                    className="max-w-[300px]" defaultValue={password}
                                    onChange={(e) => setPassword(e.target.value)}/>
                        <FormSelect
                            label="Select Role"
                            name="role"
                            options={ROLE_OPTIONS}
                            getValueOnChange={({value}) => setSelectedRole(value as ROLES_ENUMS)}
                        />
                        <div className="flex flex-wrap gap-2 justify-between mt-5">
                            {departments.map((department) => (
                                <FormCheckbox
                                    key={department.value}
                                    initialValue={department.isSelected}
                                    name={department.name}
                                    label={department.name.charAt(0).toUpperCase() + department.name.slice(1)}
                                    getValueOnChange={({name, value}) => handleDepartmentChange(name, value)}
                                />
                            ))}
                        </div>


                        <div className="mt-4 p-4 border rounded-lg bg-gray-100">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{`
Username: ${username}
Email: ${newMemberEmail}
Admin Name: ${selectedTeam}
Password: ${password}
Role: ${ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label}
Departments: ${departments.filter((d) => d.isSelected).map((d) => d.name).join(", ")}
                            `}</pre>
                            <button onClick={handleCopyDetails}
                                    className="mt-2 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md">
                                <ClipboardIcon size={16}/>
                                Copy Details
                            </button>
                        </div>

                        <Buttons label={loading ? "Sending..." : "Create Admin"} type="smPrimaryButton" fullWidth
                                 onClick={handleAddMember} disabled={loading}/>
                    </div>
                </>
            </Modal>
        </header>
    );
};

export default Header;
