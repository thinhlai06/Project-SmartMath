import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/api';
import { useToast } from '@/components/ui/toast';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: { full_name?: string; current_password?: string; new_password?: string } = {};

    if (fullName.trim() && fullName.trim() !== user?.full_name) {
      payload.full_name = fullName.trim();
    }

    if (newPassword.trim()) {
      payload.current_password = currentPassword;
      payload.new_password = newPassword.trim();
    }

    if (Object.keys(payload).length === 0) {
      toast('Không có thay đổi để lưu', 'info');
      return;
    }

    setIsSaving(true);
    try {
      await authApi.updateMe(payload);
      await refreshUser();
      setCurrentPassword('');
      setNewPassword('');
      toast('Đã cập nhật hồ sơ thành công', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ';
      toast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-extrabold text-slate-800">Hồ sơ & Cài đặt</h1>
        <p className="mb-6 text-sm text-slate-500">Cập nhật thông tin cá nhân và mật khẩu đăng nhập.</p>

        <Card className="rounded-3xl border-none bg-white/80 p-6 shadow-sm">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ''} disabled className="mt-1" />
            </div>

            <div>
              <Label htmlFor="full-name">Họ và tên</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-1"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">Đổi mật khẩu (tùy chọn)</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
