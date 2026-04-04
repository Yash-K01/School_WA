import dashboardService from '../services/dashboardService.js';

export async function getDashboardStats(req, res) {
  try {
    const start = Date.now();
    let schoolId = req.user?.school_id || req.query.schoolId || req.body.schoolId;
    if (!schoolId) {
      schoolId = 1;
    }
    console.log(`🚀 [Dashboard] Starting stats fetch for schoolId: ${schoolId}...`);

    const results = await Promise.all([
      dashboardService.getTotalInquiries(schoolId),
      dashboardService.getConversionRate(schoolId),
      dashboardService.getActiveLeads(schoolId),
      dashboardService.getEnrolledStudents(schoolId),
      dashboardService.getPendingApplications(schoolId),
      dashboardService.getOffersSent(schoolId),
      dashboardService.getFeesCollected(schoolId)
    ]);

    const [
      totalInquiries,
      conversionRate,
      activeLeads,
      enrolledStudents,
      pendingApplications,
      offersSent,
      feesCollected
    ] = results;

    const duration = Date.now() - start;
    console.log(`✅ [Dashboard] Stats fetched successfully in ${duration}ms`);

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
    console.error('❌ [Dashboard] stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats', detail: err.message });
  }
}
