"use client";
import FormInputs from '@/components/formInputs/formInputs';
import { useUI } from '@/contexts/uiContext';
import React, { useEffect, useState } from 'react';
import Header from './Header';
import { useAuth } from '@/contexts/authContext';
import axiosInstance from '@/helpers/axiosInstance';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { setShowHeader } = useUI();
  useEffect(() => {
    setShowHeader(false);
  }, []);

  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editingPhoneNumber, setEditingPhoneNumber] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(authState.userDetails?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.patch(`/users/${authState.userDetails?.id}`, { phone: phoneNumber }, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      if (response.data.success) {
        setEditingPhoneNumber(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/change-temp-password',
          {
            current_password: passwordData.currentPassword,
            new_password: passwordData.newPassword,
          },
          {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      if (response.data.status) {
        toast.success("Password updated successfully");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error changing password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className='bg-white w-full min-h-screen p-4'>
        <Header />
        <div className='max-w-xl mx-auto space-y-6 mt-6'>
          <div className='flex border-b pb-2 space-x-4'>
            <button className={`pb-2 ${activeTab === 'profile' ? 'border-b-2 border-[#01AB79] font-semibold' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
            <button className={`pb-2 ${activeTab === 'password' ? 'border-b-2 border-[#01AB79] font-semibold' : ''}`} onClick={() => setActiveTab('password')}>Change Password</button>
          </div>

          {isLoading && (
              <div className='fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50'>
                <div>Updating...</div>
              </div>
          )}

          {activeTab === 'profile' && (
              <div>
                <h2 className='text-xl font-semibold'>Profile Information</h2>
                <FormInputs disabled label='First Name' defaultValue={authState.userDetails?.name} name={''}/>
                <FormInputs disabled label='Last Name' defaultValue={authState.userDetails?.name} name={''}/>
                <FormInputs disabled label='Email Address' defaultValue={authState.userDetails?.email} name={''}/>
                <FormInputs
                    name={''}
                    disabled={!editingPhoneNumber}
                    label='Phone Number'
                    defaultValue={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    trailingItem={
                      <button onClick={editingPhoneNumber ? handleSave : () => setEditingPhoneNumber(true)} className='text-[#01AB79] font-medium text-sm' disabled={isLoading}>
                        {!editingPhoneNumber ? 'Edit' : 'Save'}
                      </button>
                    }
                />
              </div>
          )}

          {activeTab === 'password' && (
              <div>
                <h2 className='text-xl font-semibold mt-6'>Change Password</h2>
                <FormInputs name={''} type='password' label='Current Password' defaultValue={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                <FormInputs name={''} type='password' label='New Password' defaultValue={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                <FormInputs name={''} type='password' label='Confirm New Password' defaultValue={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                <button onClick={handleChangePassword} className='bg-[#01AB79] text-white p-2 rounded w-full' disabled={isLoading}>
                  Change Password
                </button>
              </div>
          )}
        </div>
      </div>
  );
};

export default ProfilePage;