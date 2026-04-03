import React from 'react'

const AchievementCard = React.forwardRef(({ user, weeklyStats, rank }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: '1200px',
        height: '630px',
        background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #ec4899 100%)',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          transform: 'translate(150px, -150px)',
          filter: 'blur(80px)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '350px',
          height: '350px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          transform: 'translate(-130px, 130px)',
          filter: 'blur(80px)'
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: '10' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 8px 0' }}>FocusForge</h1>
            <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.8)', margin: '0' }}>Weekly Achievement Report</p>
          </div>
          <div style={{ fontSize: '64px' }}>🏆</div>
        </div>

        {/* User info and rank */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '40px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px', margin: '0 0 8px 0' }}>User</p>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0' }}>{user?.name || 'Guest'}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px', margin: '0 0 8px 0' }}>Weekly Rank</p>
              <p style={{ fontSize: '48px', fontWeight: '900', margin: '0', color: '#fcd34d' }}>#{rank || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {/* Tasks */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{weeklyStats?.tasks || 0}</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: '0' }}>Tasks Done</p>
          </div>

          {/* Sessions */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏱️</div>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{weeklyStats?.sessions || 0}</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: '0' }}>Sessions</p>
          </div>

          {/* Focus Time */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{weeklyStats?.focusHours || 0}h</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: '0' }}>Focus Time</p>
          </div>

          {/* Completion Rate */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#86efac' }}>
              {Math.round(weeklyStats?.completionRate || 0)}%
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: '0' }}>Completion</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
          <p style={{ margin: '0' }}>✨ Inspiring focus, one session at a time</p>
          <p style={{ margin: '0' }}>focusforge.io</p>
        </div>
      </div>
    </div>
  )
})

AchievementCard.displayName = 'AchievementCard'

export default AchievementCard
