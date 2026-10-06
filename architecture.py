"""

public/
├── samples/
│   └── sample_sales.csv

src/
│
├── assets/
│   ├── branding/
│   │   ├── Kryolt.jpeg
│   │   ├── KryoltWordMark.jpeg
│   │   └── ramawtar.jpeg
│   │
│   ├── sample/
│   │   └── blank_template.csv
│   │
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
│
├── components/
│
│   ├── auth/
│   │   ├── PremiumRoute.jsx
│   │   ├── AuthModal.jsx
│   │   ├── AuthModal.css
│   │   ├── ForgetPasswordModal.jsx
│   │   ├── LoginForm.jsx
│   │   ├── OTPModal.jsx
│   │   ├── SignupForm.jsx
│   │   └── PrivateRoute.jsx
│
│   ├── common/
│   │   ├── Loader.jsx
│   │   ├── Loader.css
│   │   ├── Modal.css
│   │   └── ScrollToTop.jsx
│
│   ├── dashboard/
│   │
│   │   ├── hero/
│   │   │   ├── HeroBanner.jsx
│   │   │   └── HeroBanner.css
│   │
│   │   ├── analytics/
│   │   │   ├── BusinessSummary.jsx
│   │   │   ├── BusinessSummary.css
│   │   │   ├── KPIAnalytics.jsx
│   │   │   └── KPIAnalytics.css
│   │
│   │   ├── filters/
│   │   │   ├── DateFilter.jsx
│   │   │   └── DateFilter.css
│   │
│   │   ├── upload/
│   │   │   ├── UploadCSV.jsx
│   │   │   ├── UploadCSV.css
│   │   │   ├── CSVValidator.jsx
│   │   │   ├── FilePreview.jsx
│   │   │   └── UploadProgress.jsx
│   │
│   │   ├── navigation/
│   │   │   ├── DashboardNavbar.jsx
│   │   │   ├── DashboardNavbar.css
│   │   │   ├── Sidebar.jsx
│   │   │   └── Sidebar.css
│   │
│   │   ├── cards/
│   │   │   ├── DashboardCards.jsx
│   │   │   ├── DashboardCards.css
│   │   │   ├── ExecutiveWidgets.jsx
│   │   │   └── ExecutiveWidgets.css
│   │
│   │   ├── charts/
│   │   │   ├── SalesChart.jsx
│   │   │  ├── MonthlySalesChart.jsx
│   │   │  ├── PaymentChart.jsx
│   │   │  ├── ProductColumnChart.jsx
│   │   │  └── *.css
│   │
│   │   └── table/
│   │       ├── DataTable.jsx
│   │       ├── RecentTransaction.jsx
│   │       ├── TopCustomers.jsx
│   │       └── *.css
│
│   ├── insights/
│   │
│   │   ├── Insights.jsx
│   │   ├── Insights.css
│   │
│   │   ├── hero/
│   │   │   ├── InsightsHero.jsx
│   │   │   └── InsightsHero.css
│   │
│   │   ├── summary/
│   │   │   ├── ExecutiveSummary.jsx
│   │   │   └── ExecutiveSummary.css
│   │
│   │   ├── performance/
│   │   │   ├── PerformanceAnalysis.jsx
│   │   │   └── PerformanceAnalysis.css
│   │
│   │   ├── recommendations/
│   │   │   ├── AIRecommendations.jsx
│   │   │   └── AIRecommendations.css
│   │
│   │   ├── growth/
│   │   │   ├── GrowthOpportunities.jsx
│   │   │   └── GrowthOpportunities.css
│   │
│   │   ├── forecast/
│   │   │   ├── RevenueForecast.jsx
│   │   │   └── RevenueForecast.css
│   │
│   │   ├── overview/
│   │   │   ├── AIOverview.jsx
│   │   │   └── AIOverview.css
│   │
│   │   └── risk/
│   │       ├── RiskAnalysis.jsx
│   │       └── RiskAnalysis.css
│
│   ├── customers/
│   │
│   │   ├── hero/
│   │   │   ├── CustomerHero.jsx
│   │   │   └── CustomerHero.css
│   │
│   │   ├── cards/
│   │   │   ├── CustomerCards.jsx
│   │   │   └── CustomerCards.css
│   │
│   │   ├── insights/
│   │   │   ├── CustomerInsights.jsx
│   │   │   └── CustomerInsights.css
│   │
│   │   ├── charts/
│   │   │   ├── CustomerGrowthChart.jsx
│   │   │   ├── CustomerGrowthChart.css
│   │   │   ├── CustomerRevenueChart.jsx
│   │   │   └── CustomerRevenueChart.css
│   │
│   │   └── table/
│   │       ├── TopCustomers.jsx
│   │       ├── TopCustomers.css
│   │       ├── DataTable.jsx
│   │       └── DataTable.css
|   |
│   ├── payment/
│   ├── profile/
│   ├── settings/
│   ├── upload/
│   └── home/
│
├── config/
│   ├── appConfig.js
│   ├── pricingConfig.js
│   ├── routes.js
│   └── theme.js
│
├── constants/
│   ├── appMessages.js
│   ├── chartConfig.js
│   ├── dashboardMenu.js
│   └── roles.js
│   └── dateFilter.js
│
├── context/
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   ├── UserContext.jsx
│   └── DashboardDataProvider.jsx
│   ├── DashboardFilterContext.jsx
│   └── DashboardDataContext.js
│   └── DashboardDataContext.jsx
│
├── firebase/
│   └── firebase.js
│
├── hooks/
│   ├── dashboard/
│   │   └── useDashboardData.js
│   └── upload/
│       └── useUpload.js
│
├── layouts/
│   ├── DashboardLayout.jsx
│   └── DashboardLayout.css
│
├── pages/
│
│   ├── website/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Features.jsx
│   │   ├── Pricing.jsx
│   │   ├── FAQ.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   ├── Terms.jsx
│   │   ├── CookiePolicy.jsx
│   │   ├── RefundPolicy.jsx
│   │   ├── HelpCenter.jsx
│   │   └── Documentation.jsx
│   │
│   ├── dashboard/
│   │   ├── DashboardHome.jsx
│   │   ├── DashboardHome.css
│   │   ├── AIInsights.jsx
│   │   ├── AIInsights.css
│   │   ├── Upload.jsx
│   │   ├── Customers.jsx
│   │   ├── Reports.jsx
│   │   ├── Profile.jsx
│   │   └── Settings.jsx
│   │
│   └── pricing/
│       └── CheckoutPage.jsx
│
├── services/
│   ├── ai/
│   │   └── aiService.js
│   ├── auth/
│   ├── billing/
│   ├── dashboard/
│   ├── payment/
│   ├── report/
│   └── upload/
│
├── utils/
│   ├── analytics/
│   │   ├── analytics.js
│   │   └── aiInsights.js
            filterDataByDate.js
            >
│   ├── csv/
            columnMapper.js
            DataCleaner.js
            >
│   └── storage/
            indexDB.js
            >
|__ workers
|       uploadProcessing.worker.js
│
├── App.jsx
├── main.jsx
├── App.css
└── index.css

backend/

    config
        coupons.js
        pricing.js
        >
│
├── controllers/
│   └── paymentController.js
│
├── middleware/
│   └── verifySignature.js
│
├── routes/
│   └── paymentRoutes.js
│
├── services/
│   ├── firebaseAdmin.js
│   ├── razorpayService.js
│   └── subscriptionService.js
│
├── utils/
│   └── response.js
│
├── server.js
├── package.json
├── serviceAccount.json
└── .env

"""