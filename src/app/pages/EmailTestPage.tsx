import { useState } from 'react';
import { API_BASE_URL, publicAnonKey } from '../utils/api';

export function EmailTestPage() {
  const [email, setEmail] = useState('hantakalidhoti@gmail.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');


  const testEmail = async () => {
    setLoading(true);
    setResult(null);
    setError('');

    try {
      console.log('Testing email to:', email);
      
      const response = await fetch(`${API_BASE_URL}/test-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      console.log('Test email response:', data);

      setResult(data);

      if (data.success) {
        alert('Email sent successfully! Check your inbox (and spam folder)');
      } else {
        setError(data.error || 'Failed to send email');
      }
    } catch (err: any) {
      console.error('Test email error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSignup = async () => {
    setLoading(true);
    setResult(null);
    setError('');

    try {
      console.log('Testing signup OTP to:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            email,
            name: 'Test User'
          }),
        }
      );

      const data = await response.json();
      console.log('Signup response:', data);

      setResult(data);

      if (data.success) {
        alert('Signup OTP sent! Check your inbox (and spam folder)');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-[56px] pb-[64px]">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-[#0A64BC]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Email Test Tool</h1>
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" title="Active"></div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-[#0A64BC] focus:ring-2 focus:ring-[#0A64BC] focus:ring-opacity-20 outline-none transition-all text-lg"
                placeholder="your@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={testEmail}
                disabled={loading || !email}
                className="bg-[#0A64BC] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#084a8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Test Email'}
              </button>

              <button
                onClick={testSignup}
                disabled={loading || !email}
                className="bg-green-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Test Signup'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-800 mb-1">Error</p>
                <p className="text-xs text-red-600 font-mono break-all">{error}</p>
              </div>
            )}

            {result && (
              <div className={`border-2 rounded-xl p-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  {result.success ? 'Response' : 'Response'}
                </p>
                <pre className="text-xs font-mono bg-white p-4 rounded-lg overflow-auto max-h-60 border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <p className="text-sm font-semibold text-blue-900 mb-3">Instructions</p>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Enter your email address above</li>
                <li>• Click "Test Email" to test basic email delivery</li>
                <li>• Click "Test Signup" to test the actual signup OTP flow</li>
                <li>• Check your inbox AND spam folder</li>
                <li>• Check browser console for detailed logs</li>
              </ul>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-700 mb-3">
                <strong>Debugging Resources:</strong>
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <strong>API Key Status:</strong> Check server console logs
                </p>
                <p className="text-gray-600">
                  <strong>Resend Dashboard:</strong>{' '}
                  <a 
                    href="https://resend.com/emails" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#0A64BC] underline hover:text-[#084a8f]"
                  >
                    View sent emails →
                  </a>
                </p>
                <p className="text-gray-600">
                  <strong>API Keys:</strong>{' '}
                  <a 
                    href="https://resend.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#0A64BC] underline hover:text-[#084a8f]"
                  >
                    Manage keys →
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <p className="text-sm font-semibold text-yellow-900 mb-3">Common Issues</p>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li><strong>1.</strong> Email in spam folder - check junk mail</li>
                <li><strong>2.</strong> RESEND_API_KEY not set in Supabase Edge Functions</li>
                <li><strong>3.</strong> Invalid or expired API key</li>
                <li><strong>4.</strong> Wrong email address or typo</li>
                <li><strong>5.</strong> Rate limiting (100 emails/day on free tier)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/"
            className="text-[#0A64BC] hover:text-[#084a8f] font-semibold underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
