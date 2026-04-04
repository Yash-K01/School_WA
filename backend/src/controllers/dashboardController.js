import dashboardService from '../services/dashboardService.js';

export async function getDashboardStats(req, res) {
  try {
    // Extract schoolId from user, query, or body. Use a default for dev/demo if missing.
    let schoolId = req.user?.school_id || req.query.schoolId || req.body.schoolId;
    if (!schoolId) {
      // For production, you may want to restrict this. For dev/demo, fallback to 1.
      console.warn('[Dashboard] schoolId missing in request. Using default schoolId=1');
      schoolId = 1;
    }
    const [
      totalInquiries,
      conversionRate,
      activeLeads,
      enrolledStudents,
      pendingApplications,
      offersSent,
      feesCollected
    ] = await Promise.all([
      dashboardService.getTotalInquiries(schoolId),
      dashboardService.getConversionRate(schoolId),
      dashboardService.getActiveLeads(schoolId),
      dashboardService.getEnrolledStudents(schoolId),
      dashboardService.getPendingApplications(schoolId),
      dashboardService.getOffersSent(schoolId),
      dashboardService.getFeesCollected(schoolId)
    ]);
    res.json({
      totalInquiries,
      conversionRate,
      activeLeads,
      enrolledStudents,
      pendingApplications,
      offersSent,
      feesCollected
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}
