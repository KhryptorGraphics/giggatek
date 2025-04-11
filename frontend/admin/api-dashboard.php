<?php
/**
 * API Dashboard
 *
 * This page displays the API usage dashboard.
 */

// Include necessary files
require_once '../includes/header.php';
require_once '../includes/auth.php';

// Check if user is logged in and has admin privileges
if (!isLoggedIn() || !hasPermission('VIEW_ANALYTICS')) {
    header('Location: ../login.php?redirect=' . urlencode($_SERVER['REQUEST_URI']));
    exit;
}

// Get time range from query parameters
$timeRange = isset($_GET['time_range']) ? $_GET['time_range'] : '24h';
$validTimeRanges = ['15m', '1h', '6h', '24h', '7d', '30d'];
if (!in_array($timeRange, $validTimeRanges)) {
    $timeRange = '24h';
}

// Format time range for display
$timeRangeFormatted = '';
switch ($timeRange) {
    case '15m':
        $timeRangeFormatted = 'Last 15 minutes';
        break;
    case '1h':
        $timeRangeFormatted = 'Last hour';
        break;
    case '6h':
        $timeRangeFormatted = 'Last 6 hours';
        break;
    case '24h':
        $timeRangeFormatted = 'Last 24 hours';
        break;
    case '7d':
        $timeRangeFormatted = 'Last 7 days';
        break;
    case '30d':
        $timeRangeFormatted = 'Last 30 days';
        break;
}

// Get API stats
$apiStats = [];
$apiStatsFile = '../data/analytics/api-stats.json';
if (file_exists($apiStatsFile)) {
    $apiStats = json_decode(file_get_contents($apiStatsFile), true);
}

// If no stats file exists, generate mock data
if (empty($apiStats)) {
    $apiStats = [
        'total_requests' => rand(1000, 10000),
        'requests_per_minute' => rand(10, 100) / 10,
        'average_response_time' => rand(50, 500),
        'error_rate' => rand(1, 10) / 100,
        'status_categories' => [
            '2xx' => rand(800, 9000),
            '3xx' => rand(50, 500),
            '4xx' => rand(10, 200),
            '5xx' => rand(1, 50)
        ],
        'endpoints' => [
            [
                'endpoint' => 'GET:/api/v1/products',
                'count' => rand(500, 5000),
                'average_response_time' => rand(30, 300),
                'error_rate' => rand(1, 5) / 100
            ],
            [
                'endpoint' => 'GET:/api/v1/products/{id}',
                'count' => rand(300, 3000),
                'average_response_time' => rand(20, 200),
                'error_rate' => rand(1, 5) / 100
            ],
            [
                'endpoint' => 'POST:/api/v1/orders',
                'count' => rand(100, 1000),
                'average_response_time' => rand(100, 500),
                'error_rate' => rand(3, 8) / 100
            ],
            [
                'endpoint' => 'GET:/api/v1/orders',
                'count' => rand(200, 2000),
                'average_response_time' => rand(50, 300),
                'error_rate' => rand(1, 5) / 100
            ],
            [
                'endpoint' => 'GET:/api/v1/rentals',
                'count' => rand(100, 1000),
                'average_response_time' => rand(50, 300),
                'error_rate' => rand(1, 5) / 100
            ]
        ],
        'error_types' => [
            'ValidationError' => rand(10, 100),
            'AuthenticationError' => rand(5, 50),
            'NotFoundError' => rand(10, 100),
            'DatabaseError' => rand(1, 20),
            'InternalServerError' => rand(1, 10)
        ]
    ];
}

// Get recent errors
$recentErrors = [];
$errorsDir = '../data/analytics/errors';
if (is_dir($errorsDir)) {
    $errorFiles = glob($errorsDir . '/*.json');
    rsort($errorFiles); // Sort by newest first

    foreach (array_slice($errorFiles, 0, 10) as $errorFile) {
        $errors = json_decode(file_get_contents($errorFile), true);
        if (is_array($errors)) {
            $recentErrors = array_merge($recentErrors, $errors);
        }
    }

    // Sort by timestamp (newest first)
    usort($recentErrors, function($a, $b) {
        return $b['timestamp'] <=> $a['timestamp'];
    });

    // Limit to 10 errors
    $recentErrors = array_slice($recentErrors, 0, 10);
} else {
    // Generate mock errors if no error files exist
    for ($i = 0; $i < 5; $i++) {
        $errorTypes = ['ValidationError', 'AuthenticationError', 'NotFoundError', 'DatabaseError', 'InternalServerError'];
        $endpoints = ['GET:/api/v1/products', 'GET:/api/v1/products/123', 'POST:/api/v1/orders', 'GET:/api/v1/orders', 'GET:/api/v1/rentals'];

        $recentErrors[] = [
            'timestamp' => time() - rand(0, 24 * 60 * 60),
            'endpoint' => $endpoints[array_rand($endpoints)],
            'method' => ['GET', 'POST', 'PUT', 'DELETE'][array_rand(['GET', 'POST', 'PUT', 'DELETE'])],
            'error_type' => $errorTypes[array_rand($errorTypes)],
            'error_message' => 'Mock error message for testing',
            'user_id' => rand(0, 1) ? rand(1, 100) : null,
            'ip_address' => '192.168.1.' . rand(1, 255)
        ];
    }

    // Sort by timestamp (newest first)
    usort($recentErrors, function($a, $b) {
        return $b['timestamp'] <=> $a['timestamp'];
    });
}

// Get rate limit status
$rateLimitStatus = [];
$rateLimitFile = '../data/analytics/rate-limits.json';
if (file_exists($rateLimitFile)) {
    $rateLimitStatus = json_decode(file_get_contents($rateLimitFile), true);
}

// If no rate limit file exists, generate mock data
if (empty($rateLimitStatus)) {
    $rateLimitStatus = [
        'ip_rate_limit' => [
            'limit' => 100,
            'per' => 60,
            'burst' => 120,
            'clients' => [
                '192.168.1.1' => [
                    'remaining' => rand(0, 100),
                    'reset' => time() + rand(1, 60)
                ],
                '192.168.1.2' => [
                    'remaining' => rand(0, 100),
                    'reset' => time() + rand(1, 60)
                ]
            ]
        ],
        'user_rate_limit' => [
            'limit' => 300,
            'per' => 60,
            'burst' => 350,
            'clients' => [
                '123' => [
                    'remaining' => rand(0, 300),
                    'reset' => time() + rand(1, 60)
                ],
                '456' => [
                    'remaining' => rand(0, 300),
                    'reset' => time() + rand(1, 60)
                ]
            ]
        ],
        'endpoint_rate_limits' => [
            'GET:/api/v1/products' => [
                'limit' => 60,
                'per' => 60,
                'clients' => rand(1, 100)
            ],
            'POST:/api/v1/orders' => [
                'limit' => 30,
                'per' => 60,
                'clients' => rand(1, 50)
            ]
        ]
    ];
}

// Get blocked IPs
$blockedIPs = [];
$blockedIPsFile = '../data/analytics/blocked-ips.json';
if (file_exists($blockedIPsFile)) {
    $blockedIPs = json_decode(file_get_contents($blockedIPsFile), true);
}

// If no blocked IPs file exists, generate mock data
if (empty($blockedIPs)) {
    $blockedIPs = [
        '192.168.1.100' => [
            'expires_at' => time() + rand(1, 3600),
            'reason' => 'Rate limit exceeded'
        ],
        '192.168.1.101' => [
            'expires_at' => time() + rand(1, 3600),
            'reason' => 'SQL injection attempt'
        ]
    ];
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Dashboard - GigGatek Admin</title>
    <link rel="stylesheet" href="../css/bootstrap.min.css">
    <link rel="stylesheet" href="../css/admin.css">
    <script src="../js/chart.min.js"></script>
    <style>
        .card {
            margin-bottom: 20px;
        }
        .stat-card {
            text-align: center;
            padding: 20px;
        }
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
        }
        .stat-label {
            font-size: 1rem;
            color: #6c757d;
        }
        .chart-container {
            position: relative;
            height: 300px;
            width: 100%;
        }
        .error-rate {
            color: <?php echo ($apiStats['error_rate'] > 0.05) ? '#dc3545' : '#28a745'; ?>;
        }
    </style>
</head>
<body>
    <?php include '../includes/admin-navbar.php'; ?>

    <div class="container-fluid mt-4">
        <div class="row mb-4">
            <div class="col">
                <h1>API Dashboard</h1>
                <p>Monitor API usage and performance</p>
            </div>
            <div class="col-auto">
                <div class="btn-group" role="group">
                    <a href="?time_range=15m" class="btn btn-outline-primary <?php echo ($timeRange === '15m') ? 'active' : ''; ?>">15m</a>
                    <a href="?time_range=1h" class="btn btn-outline-primary <?php echo ($timeRange === '1h') ? 'active' : ''; ?>">1h</a>
                    <a href="?time_range=6h" class="btn btn-outline-primary <?php echo ($timeRange === '6h') ? 'active' : ''; ?>">6h</a>
                    <a href="?time_range=24h" class="btn btn-outline-primary <?php echo ($timeRange === '24h') ? 'active' : ''; ?>">24h</a>
                    <a href="?time_range=7d" class="btn btn-outline-primary <?php echo ($timeRange === '7d') ? 'active' : ''; ?>">7d</a>
                    <a href="?time_range=30d" class="btn btn-outline-primary <?php echo ($timeRange === '30d') ? 'active' : ''; ?>">30d</a>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-3">
                <div class="card stat-card">
                    <div class="stat-value"><?php echo number_format($apiStats['total_requests']); ?></div>
                    <div class="stat-label">Total Requests</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card">
                    <div class="stat-value"><?php echo number_format($apiStats['requests_per_minute'], 2); ?></div>
                    <div class="stat-label">Requests per Minute</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card">
                    <div class="stat-value"><?php echo number_format($apiStats['average_response_time'], 2); ?></div>
                    <div class="stat-label">Avg Response Time (ms)</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card">
                    <div class="stat-value error-rate"><?php echo number_format($apiStats['error_rate'] * 100, 2); ?>%</div>
                    <div class="stat-label">Error Rate</div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Status Code Distribution</h5>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="statusChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Error Types</h5>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="errorChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Top Endpoints</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Endpoint</th>
                                        <th>Requests</th>
                                        <th>Avg Response Time</th>
                                        <th>Error Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($apiStats['endpoints'] as $endpoint): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($endpoint['endpoint']); ?></td>
                                        <td><?php echo number_format($endpoint['count']); ?></td>
                                        <td><?php echo number_format($endpoint['average_response_time'], 2); ?> ms</td>
                                        <td><?php echo number_format($endpoint['error_rate'] * 100, 2); ?>%</td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Recent Errors</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Endpoint</th>
                                        <th>Method</th>
                                        <th>Error Type</th>
                                        <th>Error Message</th>
                                        <th>User ID</th>
                                        <th>IP Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($recentErrors as $error): ?>
                                    <tr>
                                        <td><?php echo date('Y-m-d H:i:s', $error['timestamp']); ?></td>
                                        <td><?php echo htmlspecialchars($error['endpoint']); ?></td>
                                        <td><?php echo htmlspecialchars($error['method']); ?></td>
                                        <td><?php echo htmlspecialchars($error['error_type']); ?></td>
                                        <td><?php echo htmlspecialchars($error['error_message']); ?></td>
                                        <td><?php echo $error['user_id'] ? htmlspecialchars($error['user_id']) : 'Anonymous'; ?></td>
                                        <td><?php echo htmlspecialchars($error['ip_address']); ?></td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Rate Limits</h5>
                    </div>
                    <div class="card-body">
                        <h6>IP Rate Limit: <?php echo $rateLimitStatus['ip_rate_limit']['limit']; ?> requests per <?php echo $rateLimitStatus['ip_rate_limit']['per']; ?> seconds</h6>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>IP Address</th>
                                        <th>Remaining</th>
                                        <th>Reset</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($rateLimitStatus['ip_rate_limit']['clients'] as $ip => $data): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($ip); ?></td>
                                        <td><?php echo $data['remaining']; ?></td>
                                        <td><?php echo date('H:i:s', $data['reset']); ?></td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>

                        <h6 class="mt-4">User Rate Limit: <?php echo $rateLimitStatus['user_rate_limit']['limit']; ?> requests per <?php echo $rateLimitStatus['user_rate_limit']['per']; ?> seconds</h6>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Remaining</th>
                                        <th>Reset</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($rateLimitStatus['user_rate_limit']['clients'] as $userId => $data): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($userId); ?></td>
                                        <td><?php echo $data['remaining']; ?></td>
                                        <td><?php echo date('H:i:s', $data['reset']); ?></td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Blocked IPs</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>IP Address</th>
                                        <th>Expires At</th>
                                        <th>Reason</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($blockedIPs as $ip => $data): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($ip); ?></td>
                                        <td><?php echo date('Y-m-d H:i:s', $data['expires_at']); ?></td>
                                        <td><?php echo htmlspecialchars($data['reason']); ?></td>
                                        <td>
                                            <form method="post" action="unblock-ip.php">
                                                <input type="hidden" name="ip" value="<?php echo htmlspecialchars($ip); ?>">
                                                <button type="submit" class="btn btn-sm btn-danger">Unblock</button>
                                            </form>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>

                        <hr>

                        <h6>Block IP Address</h6>
                        <form method="post" action="block-ip.php" class="row g-3">
                            <div class="col-md-4">
                                <label for="ip" class="form-label">IP Address</label>
                                <input type="text" class="form-control" id="ip" name="ip" placeholder="192.168.1.1" required>
                            </div>
                            <div class="col-md-3">
                                <label for="duration" class="form-label">Duration (seconds)</label>
                                <select class="form-select" id="duration" name="duration" required>
                                    <option value="300">5 minutes</option>
                                    <option value="3600" selected>1 hour</option>
                                    <option value="86400">1 day</option>
                                    <option value="604800">1 week</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label for="reason" class="form-label">Reason</label>
                                <select class="form-select" id="reason" name="reason" required>
                                    <option value="Manual block">Manual block</option>
                                    <option value="Suspicious activity">Suspicious activity</option>
                                    <option value="Rate limit exceeded">Rate limit exceeded</option>
                                    <option value="SQL injection attempt">SQL injection attempt</option>
                                    <option value="XSS attempt">XSS attempt</option>
                                </select>
                            </div>
                            <div class="col-md-2 d-flex align-items-end">
                                <button type="submit" class="btn btn-primary">Block IP</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/jquery.min.js"></script>
    <script src="../js/bootstrap.bundle.min.js"></script>
    <script>
        // Status code chart
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        const statusChart = new Chart(statusCtx, {
            type: 'pie',
            data: {
                labels: [
                    <?php foreach ($apiStats['status_categories'] as $category => $count): ?>
                    '<?php echo $category; ?>',
                    <?php endforeach; ?>
                ],
                datasets: [{
                    data: [
                        <?php foreach ($apiStats['status_categories'] as $category => $count): ?>
                        <?php echo $count; ?>,
                        <?php endforeach; ?>
                    ],
                    backgroundColor: [
                        '#28a745', // 2xx - Success
                        '#17a2b8', // 3xx - Redirection
                        '#ffc107', // 4xx - Client Error
                        '#dc3545'  // 5xx - Server Error
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Error type chart
        const errorCtx = document.getElementById('errorChart').getContext('2d');
        const errorChart = new Chart(errorCtx, {
            type: 'bar',
            data: {
                labels: [
                    <?php foreach ($apiStats['error_types'] as $type => $count): ?>
                    '<?php echo $type; ?>',
                    <?php endforeach; ?>
                ],
                datasets: [{
                    label: 'Errors',
                    data: [
                        <?php foreach ($apiStats['error_types'] as $type => $count): ?>
                        <?php echo $count; ?>,
                        <?php endforeach; ?>
                    ],
                    backgroundColor: '#dc3545'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>
