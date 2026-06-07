import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendCode, verifyCode, register } from '../services/api';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const STEPS = ['access', 'email', 'code', 'password'];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [accessCode, setAccessCode] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const codeRefs = useRef([]);

  // Step 0 — Verify access code
  const handleAccessCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/verify-access-code`, { accessCode });
      setSuccess('Access granted!');
      setTimeout(() => { setSuccess(''); setStep(1); }, 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid access code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 — Send email code
  const handleSendCode = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendCode(email, accessCode);
      setSuccess('Verification code sent! Check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Verify email code
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) codeRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      codeRefs.current[5]?.focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) return setError('Please enter the 6-digit code.');
    setError('');
    setLoading(true);
    try {
      await verifyCode(email, fullCode);
      setSuccess('Code verified! Set your password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    setError('');
    setLoading(true);
    try {
      await register({ email, code: code.join(''), password, confirmPassword, accessCode });
      setSuccess('Account created successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const stepConfig = [
    { title: 'Code d\'accès', subtitle: 'Entrez le code d\'accès Hosting Manager', icon: '🔑' },
    { title: 'Créer votre compte', subtitle: 'Entrez votre adresse email', icon: '✉️' },
    { title: 'Vérification email', subtitle: `Code envoyé à ${email}`, icon: '🔐' },
    { title: 'Mot de passe', subtitle: 'Choisissez un mot de passe sécurisé', icon: '🔒' },
  ];

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">⚡</div>
          <h1>Hosting Manager</h1>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: '3px', borderRadius: '2px',
              background: i <= step ? 'var(--accent)' : 'var(--border-subtle)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stepConfig[step].icon}</div>
        <h2 className="auth-title">{stepConfig[step].title}</h2>
        <p className="auth-subtitle">{stepConfig[step].subtitle}</p>

        {error && <div className="hm-alert hm-alert-error mb-3"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
        {success && <div className="hm-alert hm-alert-success mb-3"><i className="bi bi-check-circle me-2"></i>{success}</div>}

        {/* Step 0 — Access Code */}
        {step === 0 && (
          <form onSubmit={handleAccessCode}>
            <div className="mb-4">
              <label className="hm-label">Code d'accès</label>
              <div className="position-relative">
                <input
                  type="password"
                  className="form-control hm-input"
                  placeholder="Entrez le code d'accès"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                  autoFocus
                  style={{ letterSpacing: '2px', fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                <i className="bi bi-shield-lock me-1"></i>
                Code fourni par l'administrateur uniquement
              </div>
            </div>
            <button type="submit" className="btn btn-primary-hm w-100" disabled={loading}>
              {loading
                ? <><span className="hm-spinner me-2"></span>Vérification...</>
                : <>Valider le code <i className="bi bi-arrow-right ms-1"></i></>
              }
            </button>
          </form>
        )}

        {/* Step 1 — Email */}
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <div className="mb-4">
              <label className="hm-label">Adresse email</label>
              <input
                type="email"
                className="form-control hm-input"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary-hm w-100" disabled={loading}>
              {loading
                ? <><span className="hm-spinner me-2"></span>Envoi...</>
                : <>Envoyer le code <i className="bi bi-arrow-right ms-1"></i></>
              }
            </button>
          </form>
        )}

        {/* Step 2 — Email OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div className="code-input-group" onPaste={handleCodePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (codeRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  className="form-control code-digit"
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Pas reçu ?{' '}
              <button type="button" onClick={handleSendCode}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: 0 }}>
                Renvoyer
              </button>
            </p>
            <button type="submit" className="btn btn-primary-hm w-100" disabled={loading}>
              {loading
                ? <><span className="hm-spinner me-2"></span>Vérification...</>
                : <>Vérifier le code <i className="bi bi-arrow-right ms-1"></i></>
              }
            </button>
          </form>
        )}

        {/* Step 3 — Password */}
        {step === 3 && (
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="hm-label">Mot de passe</label>
              <div className="position-relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-control hm-input"
                  placeholder="Min. 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  style={{ paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>
                  <i className={`bi bi-eye${showPw ? '-slash' : ''}`}></i>
                </button>
              </div>
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: password.length >= i * 3
                          ? (password.length >= 12 ? 'var(--success)' : password.length >= 8 ? 'var(--warning)' : 'var(--danger)')
                          : 'var(--border-subtle)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: password.length >= 12 ? 'var(--success)' : password.length >= 8 ? 'var(--warning)' : 'var(--danger)' }}>
                    {password.length >= 12 ? '✓ Fort' : password.length >= 8 ? '~ Correct' : '✗ Trop court'}
                  </span>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="hm-label">Confirmer le mot de passe</label>
              <input
                type="password"
                className="form-control hm-input"
                placeholder="Répétez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && (
                <div style={{ fontSize: '12px', marginTop: '6px', color: password === confirmPassword ? 'var(--success)' : 'var(--danger)' }}>
                  <i className={`bi bi-${password === confirmPassword ? 'check' : 'x'}-circle me-1`}></i>
                  {password === confirmPassword ? 'Mots de passe identiques' : 'Mots de passe différents'}
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary-hm w-100"
              disabled={loading || password !== confirmPassword}>
              {loading
                ? <><span className="hm-spinner me-2"></span>Création du compte...</>
                : <>Créer mon compte <i className="bi bi-check2 ms-1"></i></>
              }
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
