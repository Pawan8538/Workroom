// ─────────────────────────────────────────────────────────────
// server/routes/doorkeeper.routes.js
// Routes for silent tracking pulse & Admin Dashboard (/admin)
// ─────────────────────────────────────────────────────────────
// Includes simple Basic Auth middleware checking process.env.ADMIN_PASSWORD.
// Serves a clean dark HTML dashboard matching Workroom aesthetics.
// This route must never appear in public client code or README.
// ─────────────────────────────────────────────────────────────

import express from 'express';
import Visitor from '../models/Visitor.model.js';
import ChapterRequest from '../models/ChapterRequest.model.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// 1. PUBLIC TRACKING ENDPOINT
// ─────────────────────────────────────────────────────────────
router.post('/api/doorkeeper/track', (req, res) => {
  // Actual recording is handled asynchronously by visitorTracker middleware
  res.status(204).send(); // Silent success
});

// ─────────────────────────────────────────────────────────────
// 2. ADMIN AUTH MIDDLEWARE
// ─────────────────────────────────────────────────────────────
const adminAuth = (req, res, next) => {
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  // Simple check against environment password or default fallback
  const adminPassword = process.env.ADMIN_PASSWORD || 'workroom_admin';

  if (password === adminPassword || login === adminPassword) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Workroom Admin Dashboard"');
  res.status(401).send('Authentication required.');
};

// ─────────────────────────────────────────────────────────────
// 3. ADMIN DASHBOARD ROUTE (/admin)
// ─────────────────────────────────────────────────────────────
router.get('/admin', adminAuth, async (req, res) => {
  try {
    // Fetch metrics
    const totalVisitors = await Visitor.countDocuments({ type: 'visitor' });
    
    // Visitors today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const visitorsToday = await Visitor.countDocuments({ type: 'visitor', firstVisit: { $gte: startOfToday } });

    // Country breakdown
    const countryBreakdownRaw = await Visitor.aggregate([
      { $match: { type: 'visitor' } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const countryBreakdown = countryBreakdownRaw.map(c => `${c._id || 'Unknown'}: ${c.count}`).join(', ') || 'None';

    // Recent visitors (last 50)
    const recentVisitors = await Visitor.find({ type: 'visitor' }).sort({ lastActivity: -1 }).limit(50);

    // Observer entries (last 50)
    const observerEntries = await Visitor.find({ type: 'observer' }).sort({ timestamp: -1 }).limit(50);

    // Chapter 2 requests
    const chapterRequests = await ChapterRequest.find({}).sort({ submittedAt: -1 });

    // Generate HTML
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Workroom — Doorkeeper Admin</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 40px;
          background: #050508;
          color: #f0f0f5;
          font-family: 'Inter', sans-serif;
        }
        h1, h2, h3 {
          font-weight: 500;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 1.8rem;
          color: #00f5ff;
          border-bottom: 1px solid rgba(0, 245, 255, 0.2);
          padding-bottom: 15px;
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 50px;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 25px;
          border-radius: 6px;
          backdrop-filter: blur(10px);
        }
        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 0.9rem;
          color: #888;
          text-transform: uppercase;
        }
        .stat-card .value {
          font-size: 2rem;
          font-weight: 600;
          color: #00f5ff;
        }
        .stat-card .sub-value {
          font-size: 1rem;
          color: #ccc;
          margin-top: 10px;
        }
        .section {
          margin-bottom: 50px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 30px;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.95rem;
        }
        th, td {
          padding: 15px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          vertical-align: middle;
        }
        th {
          color: #888;
          font-weight: 500;
          text-transform: uppercase;
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.02);
        }
        tr:hover {
          background: rgba(255, 255, 255, 0.015);
        }
        .tag {
          display: inline-block;
          padding: 3px 8px;
          background: rgba(0, 245, 255, 0.1);
          color: #00f5ff;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-right: 5px;
        }
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-approve {
          background: rgba(0, 255, 136, 0.15);
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.3);
          margin-right: 10px;
        }
        .btn-approve:hover {
          background: rgba(0, 255, 136, 0.3);
        }
        .btn-reject {
          background: rgba(255, 51, 51, 0.15);
          color: #ff3333;
          border: 1px solid rgba(255, 51, 51, 0.3);
        }
        .btn-reject:hover {
          background: rgba(255, 51, 51, 0.3);
        }
        .status-badge {
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
        }
        .status-pending { background: rgba(255, 170, 0, 0.15); color: #ffaa00; border: 1px solid rgba(255, 170, 0, 0.3); }
        .status-approved { background: rgba(0, 255, 136, 0.15); color: #00ff88; border: 1px solid rgba(0, 255, 136, 0.3); }
        .status-rejected { background: rgba(255, 51, 51, 0.15); color: #ff3333; border: 1px solid rgba(255, 51, 51, 0.3); }
        .observer-row td {
          color: #666;
          font-family: monospace;
        }
        .details-col {
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>
    </head>
    <body>
      <h1>
        <span>WORKROOM // DOORKEEPER ADMIN</span>
        <span style="font-size: 0.9rem; color: #666; font-family: monospace;">CLASSIFIED ACCESS</span>
      </h1>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Unique Visitors</h3>
          <div class="value">${totalVisitors}</div>
        </div>
        <div class="stat-card">
          <h3>Visitors Today</h3>
          <div class="value">${visitorsToday}</div>
        </div>
        <div class="stat-card">
          <h3>Country Breakdown</h3>
          <div class="sub-value">${countryBreakdown}</div>
        </div>
      </div>

      <div class="section">
        <h2>Chapter 2 Access Requests</h2>
        <table>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Qualification Reason</th>
              <th>Social Link</th>
              <th>Session ID</th>
              <th>Submitted At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${chapterRequests.map(r => `
              <tr>
                <td><strong>${r.name || 'Unknown'}</strong></td>
                <td class="details-col" title="${r.reason || ''}">${r.reason || 'None provided'}</td>
                <td><a href="${r.linkedinOrTwitter || '#'}" target="_blank" style="color: #00f5ff;">${r.linkedinOrTwitter || 'None'}</a></td>
                <td style="font-family: monospace; color: #888;">${r.sessionId}</td>
                <td>${new Date(r.submittedAt).toLocaleString()}</td>
                <td><span class="status-badge status-${r.status}">${r.status}</span></td>
                <td>
                  ${r.status === 'pending' ? `
                    <button class="btn btn-approve" onclick="updateChapterStatus('${r._id}', 'approve')">Approve</button>
                    <button class="btn btn-reject" onclick="updateChapterStatus('${r._id}', 'reject')">Reject</button>
                  ` : `<span style="color: #666;">No actions</span>`}
                </td>
              </tr>
            `).join('') || '<tr><td colspan="7" style="text-align: center; color: #666;">No requests found</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Recent Human Visitors</h2>
        <table>
          <thead>
            <tr>
              <th>Country / City</th>
              <th>Device / Browser</th>
              <th>Time Spent</th>
              <th>Agents Clicked</th>
              <th>4th Wall</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            ${recentVisitors.map(v => `
              <tr>
                <td>${v.country || 'Unknown'} / ${v.city || 'Unknown'}</td>
                <td>${v.device || 'desktop'} — ${v.browser || 'Unknown'}</td>
                <td>${v.timeSpent || 0}s</td>
                <td>${v.agentsClicked.map(a => `<span class="tag">${a}</span>`).join('') || '<span style="color: #666;">None</span>'}</td>
                <td>${v.reachedFourthWall ? '<span style="color: #00ff88;">Reached</span>' : '<span style="color: #666;">No</span>'}</td>
                <td>${new Date(v.lastActivity).toLocaleString()}</td>
              </tr>
            `).join('') || '<tr><td colspan="6" style="text-align: center; color: #666;">No visitors found</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>The Observer Entries (Silent Companions)</h2>
        <table>
          <thead>
            <tr>
              <th>Entry Type</th>
              <th>IP Address</th>
              <th>Location</th>
              <th>Device</th>
              <th>Manifested Timestamp</th>
            </tr>
          </thead>
          <tbody>
            ${observerEntries.map(o => `
              <tr class="observer-row">
                <td style="color: #ff3333;">[OBSERVER]</td>
                <td>NULL</td>
                <td>UNKNOWN</td>
                <td>UNKNOWN</td>
                <td>${new Date(o.timestamp).toISOString()}</td>
              </tr>
            `).join('') || '<tr><td colspan="5" style="text-align: center; color: #666;">No observer entries found</td></tr>'}
          </tbody>
        </table>
      </div>

      <script>
        async function updateChapterStatus(id, action) {
          try {
            const res = await fetch(\`/admin/api/chapter2/\${action}/\${id}\`, { method: 'POST' });
            if (res.ok) {
              window.location.reload();
            } else {
              alert('Failed to update status.');
            }
          } catch (err) {
            alert('Network error.');
          }
        }
      </script>
    </body>
    </html>
    `;

    res.send(html);
  } catch (err) {
    console.error('[AdminDashboard] Error generating dashboard:', err);
    res.status(500).send('Internal Server Error generating dashboard.');
  }
});

// ─────────────────────────────────────────────────────────────
// 4. ADMIN API ACTIONS (Approve / Reject)
// ─────────────────────────────────────────────────────────────
router.post('/admin/api/chapter2/approve/:id', adminAuth, async (req, res) => {
  try {
    await ChapterRequest.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

router.post('/admin/api/chapter2/reject/:id', adminAuth, async (req, res) => {
  try {
    await ChapterRequest.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

export default router;
