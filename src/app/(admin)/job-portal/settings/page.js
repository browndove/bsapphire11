'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortal } from '../PortalContext';
import PortalHeader from '../components/PortalHeader';
import PageTabs from '../components/PageTabs';
import {
  createEmployerCategory,
  deleteEmployerCategory,
  fetchEmployerCompany,
  fetchEmployerUsers,
  updateEmployerCategory,
  updateEmployerCompany,
  updateEmployerUserStatus,
  uploadFile,
} from '@/lib/job-api/client';
import { toUserMessage } from '@/lib/job-api/errors';
import { useConfirm } from '@/components/ConfirmProvider';
import MediaFilePicker from '@/components/candidate/MediaFilePicker';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'company', label: 'Company' },
  { id: 'categories', label: 'Categories' },
  { id: 'team', label: 'Team' },
];

function unwrap(data) {
  return data?.data ?? data;
}

export default function SettingsPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const {
    isReady,
    isAuthed,
    isPreview,
    user,
    categories,
    saveProfile,
    refreshData,
  } = usePortal();

  const [tab, setTab] = useState('profile');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoError, setLogoError] = useState('');

  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
    }
  }, [isReady, isAuthed, router]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name || '');
    setLastName(user.last_name || '');
    setPhone(user.phone || '');
  }, [user]);

  const loadCompany = useCallback(async () => {
    if (isPreview) {
      setCompanyName('Blvck Sapphire');
      setCompanyWebsite('https://blvcksapphire.com');
      setCompanyDescription('Modern AI solutions for enterprise.');
      setCompanyLocation('Accra, Ghana');
      return;
    }
    try {
      const data = unwrap(await fetchEmployerCompany());
      setCompanyName(data?.name || '');
      setCompanyWebsite(data?.website || '');
      setCompanyDescription(data?.description || '');
      setCompanyLocation(data?.location || '');
      setCompanyLogoUrl(data?.logo_url || '');
    } catch (err) {
      setError(toUserMessage(err));
    }
  }, [isPreview]);

  const loadUsers = useCallback(async () => {
    if (isPreview) {
      setUsers([
        { id: 'u1', email: 'preview@employer.local', role: 'employer', status: 'active' },
        { id: 'u2', email: 'recruiter@employer.local', role: 'employer', status: 'active' },
      ]);
      return;
    }
    setUsersLoading(true);
    try {
      const res = await fetchEmployerUsers({ limit: 100 });
      setUsers(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setUsersLoading(false);
    }
  }, [isPreview]);

  useEffect(() => {
    if (!isReady || !isAuthed) return;
    if (tab === 'company') loadCompany();
    if (tab === 'team') loadUsers();
  }, [isReady, isAuthed, tab, loadCompany, loadUsers]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
      });
      showToast('Profile updated');
    } catch (err) {
      setError(toUserMessage(err, 'profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setLogoError('');
    try {
      if (!isPreview) {
        let logo_url = companyLogoUrl || undefined;
        if (logoFile) {
          logo_url = await uploadFile(logoFile, 'company_logo');
        }
        await updateEmployerCompany({
          name: companyName,
          website: companyWebsite || undefined,
          description: companyDescription || undefined,
          location: companyLocation || undefined,
          logo_url,
        });
        if (logo_url) setCompanyLogoUrl(logo_url);
        setLogoFile(null);
      }
      showToast('Company profile updated');
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (!isPreview) {
        await createEmployerCategory({ name: newCategory.trim() });
        await refreshData();
      }
      setNewCategory('');
      showToast('Category created');
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editCategoryName.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (!isPreview) {
        await updateEmployerCategory(id, { name: editCategoryName.trim() });
        await refreshData();
      }
      setEditingCategory(null);
      showToast('Category updated');
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const ok = await confirm({
      title: 'Delete category?',
      message: `Remove "${name}"? Jobs using this category may need to be updated.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    setError('');
    try {
      if (!isPreview) {
        await deleteEmployerCategory(id);
        await refreshData();
      }
      showToast('Category deleted');
    } catch (err) {
      setError(toUserMessage(err));
    }
  };

  const toggleUserStatus = async (portalUser) => {
    const nextStatus = portalUser.status === 'active' ? 'disabled' : 'active';
    const ok = await confirm({
      title: nextStatus === 'disabled' ? 'Disable user?' : 'Enable user?',
      message: `${portalUser.email} will ${nextStatus === 'disabled' ? 'lose' : 'regain'} portal access.`,
      confirmText: nextStatus === 'disabled' ? 'Disable' : 'Enable',
      variant: nextStatus === 'disabled' ? 'danger' : 'default',
    });
    if (!ok) return;
    setError('');
    try {
      if (!isPreview) {
        await updateEmployerUserStatus(portalUser.id, { status: nextStatus });
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === portalUser.id ? { ...u, status: nextStatus } : u))
      );
      showToast('User updated');
    } catch (err) {
      setError(toUserMessage(err));
    }
  };

  if (!isReady || !isAuthed) return null;

  return (
    <>
      <PortalHeader title="Settings" />

      {toast ? <div className="ats-toast is-success">{toast}</div> : null}
      {error ? <div className="ats-toast is-error">{error}</div> : null}

      <PageTabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="ats-panel" style={{ marginTop: '1.25rem' }}>
        {tab === 'profile' ? (
          <form className="ats-form" onSubmit={handleSaveProfile}>
            <div className="ats-form-grid cols-2">
              <div className="ats-field">
                <label className="ats-field-label" htmlFor="prof-first">First name</label>
                <input id="prof-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="ats-field">
                <label className="ats-field-label" htmlFor="prof-last">Last name</label>
                <input id="prof-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="prof-email">Email</label>
              <input id="prof-email" type="email" value={user?.email || ''} disabled />
              <p className="ats-field-hint">Email cannot be changed here.</p>
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="prof-phone">Phone</label>
              <input id="prof-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        ) : null}

        {tab === 'company' ? (
          <form className="ats-form" onSubmit={handleSaveCompany}>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="co-logo">Company logo</label>
              <MediaFilePicker
                id="co-logo"
                purpose="company_logo"
                value={logoFile}
                previewUrl={companyLogoUrl}
                onChange={(file, validationError) => {
                  setLogoFile(file);
                  setLogoError(validationError);
                }}
                error={logoError}
                disabled={saving}
              />
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="co-name">Company name</label>
              <input id="co-name" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="co-site">Website</label>
              <input id="co-site" type="url" placeholder="https://…" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="co-loc">Location</label>
              <input id="co-loc" value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} />
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="co-desc">Description</label>
              <textarea id="co-desc" rows={4} value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save company'}
            </button>
          </form>
        ) : null}

        {tab === 'categories' ? (
          <div className="ats-form">
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div className="ats-field" style={{ flex: 1, margin: 0 }}>
                <label className="ats-field-label" htmlFor="new-cat">New category</label>
                <input id="new-cat" placeholder="e.g. Engineering" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }} disabled={saving}>
                Add
              </button>
            </form>
            <div className="ats-table-shell">
              <div className="ats-table-wrap">
                <table className="ats-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr><td colSpan={2} className="ats-table-sub">No categories yet.</td></tr>
                    ) : categories.map((cat) => (
                      <tr key={cat.id}>
                        <td>
                          {editingCategory === cat.id ? (
                            <input
                              value={editCategoryName}
                              onChange={(e) => setEditCategoryName(e.target.value)}
                              style={{ width: '100%' }}
                            />
                          ) : (
                            <strong>{cat.name}</strong>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {editingCategory === cat.id ? (
                            <>
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => handleUpdateCategory(cat.id)} disabled={saving}>Save</button>
                              <button type="button" className="btn btn-outline btn-sm" style={{ marginLeft: '0.35rem' }} onClick={() => setEditingCategory(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => { setEditingCategory(cat.id); setEditCategoryName(cat.name); }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ marginLeft: '0.35rem' }}
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'team' ? (
          usersLoading ? (
            <div className="ats-skeleton" />
          ) : (
            <div className="ats-table-shell">
              <div className="ats-table-wrap">
                <table className="ats-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={4} className="ats-table-sub">No portal users found.</td></tr>
                    ) : users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td className="ats-table-sub">{u.role || '—'}</td>
                        <td>
                          <span className={`tag ${u.status === 'active' ? 'tag-stage-hired' : 'tag-stage-declined'}`}>
                            {u.status || 'unknown'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {u.id !== user?.id ? (
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => toggleUserStatus(u)}>
                              {u.status === 'active' ? 'Disable' : 'Enable'}
                            </button>
                          ) : (
                            <span className="ats-table-sub">You</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : null}
      </div>
    </>
  );
}
