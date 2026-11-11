// Simulated Time-based One-Time Password (TOTP) generator & Brute-force resistance engine

export interface TwoFactorState {
  hasTwoFactorEnabled: boolean;
  username: string;
  attackerAttempts: number;
  attackerCrackedPassword: boolean;
  attackerBypassedMfa: boolean;
  simulationLog: string[];
  currentTotpCode: string;
  remainingSeconds: number;
  userEnteredOtp: string;
  userVerificationStatus: 'IDLE' | 'SUCCESS' | 'INVALID' | 'LOCKED_OUT';
  userFailedAttempts: number;
}

// Pseudo-TOTP generation based on time window
export function generateSimulatedTotp(secretSeed: string = 'CYBERLAB_SECRET'): { code: string; remainingSeconds: number } {
  const now = Math.floor(Date.now() / 1000);
  const timeStep = 30; // 30 second standard TOTP window (RFC 6238)
  const windowIndex = Math.floor(now / timeStep);
  const remainingSeconds = timeStep - (now % timeStep);

  // Simple deterministic hash to 6 digits for training sandbox
  let hash = 0;
  const str = `${secretSeed}_${windowIndex}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const code = (positiveHash % 1000000).toString().padStart(6, '0');

  return { code, remainingSeconds };
}

export function runAttackerSimulation(enable2fa: boolean): {
  crackedPassword: boolean;
  bypassedMfa: boolean;
  attempts: number;
  logs: string[];
} {
  const logs: string[] = [];
  logs.push('[ATTACKER] Initializing automated credential stuffing attack against target...');
  logs.push('[ATTACKER] Replaying leaked username & password pairs from dark web breaches...');
  logs.push('[ATTACKER] Attempt 1: Failed (401 Unauthorized)');
  logs.push('[ATTACKER] Attempt 2: Failed (401 Unauthorized)');
  logs.push('[ATTACKER] Attempt 3: SUCCESS! Password verified: "Company2024!"');

  if (!enable2fa) {
    logs.push('[CRITICAL] Single-factor authentication detected! Session token granted to attacker.');
    logs.push('[COMPROMISE] Attacker accessed corporate inbox, downloaded confidential reports, and escalated privileges.');
    return {
      crackedPassword: true,
      bypassedMfa: true,
      attempts: 3,
      logs
    };
  } else {
    logs.push('[DEFENSE] Server challenged: 2FA / TOTP authentication required.');
    logs.push('[ATTACKER] Attempting to brute-force 6-digit TOTP code (1,000,000 possibilities)...');
    logs.push('[ATTACKER] Tried: 192834 (Failed)');
    logs.push('[ATTACKER] Tried: 781029 (Failed)');
    logs.push('[ATTACKER] Tried: 449120 (Failed)');
    logs.push('[DEFENSE] Rate limiter activated: Account locked out after 3 failed OTP attempts.');
    logs.push('[SUCCESS] Attack aborted! Even with the valid password, the attacker could NOT breach the account without physical device possession.');
    return {
      crackedPassword: true,
      bypassedMfa: false,
      attempts: 6,
      logs
    };
  }
}

