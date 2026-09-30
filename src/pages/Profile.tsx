import React, { useState, useEffect } from 'react';
import { db, auth, doc, getDoc, setDoc, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { User, Mail, Target, Ruler, Weight, Save, LogOut } from 'lucide-react';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;

      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
        } else {
          // Create initial profile
          const initialProfile: UserProfile = {
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName || 'Usuário',
            email: auth.currentUser.email || '',
            photoUrl: auth.currentUser.photoURL || '',
            goal: '',
            weight: 0,
            height: 0
          };
          setProfile(initialProfile);
          await setDoc(docRef, initialProfile);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = (field: keyof UserProfile, value: string | number) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const saveProfile = async () => {
    if (!profile || !auth.currentUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="font-mono text-xs uppercase animate-pulse">Accessing Profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row items-center gap-8 border-b border-line pb-12">
        <div className="w-32 h-32 border border-line p-2 rounded-full overflow-hidden">
          <img
            src={profile?.photoUrl || 'https://picsum.photos/seed/user/200/200'}
            alt={profile?.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full grayscale"
          />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-5xl">{profile?.name}</h2>
          <div className="flex items-center justify-center md:justify-start gap-2 font-mono text-xs uppercase opacity-50">
            <Mail className="w-3 h-3" />
            {profile?.email}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest opacity-40">
              <Target className="w-3 h-3" />
              Objetivo Principal
            </div>
            <input
              type="text"
              value={profile?.goal || ''}
              onChange={(e) => handleUpdate('goal', e.target.value)}
              placeholder="Ex: Hipertrofia, Perda de Peso..."
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest opacity-40">
                <Weight className="w-3 h-3" />
                Peso (kg)
              </div>
              <input
                type="number"
                value={profile?.weight || 0}
                onChange={(e) => handleUpdate('weight', parseFloat(e.target.value) || 0)}
                className="input-field"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest opacity-40">
                <Ruler className="w-3 h-3" />
                Altura (cm)
              </div>
              <input
                type="number"
                value={profile?.height || 0}
                onChange={(e) => handleUpdate('height', parseFloat(e.target.value) || 0)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8 border-t md:border-t-0 md:border-l border-line/10 pt-8 md:pt-0 md:pl-12">
          <div className="space-y-4">
            <h3 className="text-2xl">Ações do Sistema</h3>
            <div className="space-y-4">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
              </button>
              <button
                onClick={() => auth.signOut()}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                ENCERRAR SESSÃO
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="pt-12 border-t border-line/10 text-center">
        <p className="font-mono text-[9px] uppercase tracking-widest opacity-20">
          User ID: {profile?.id}
        </p>
      </footer>
    </div>
  );
};
