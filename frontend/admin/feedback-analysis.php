<?php
/**
 * Feedback Analysis Tool
 * 
 * This page displays and analyzes user testing feedback.
 */

// Include necessary files
require_once '../includes/header.php';
require_once '../includes/auth.php';

// Check if user is logged in and has admin privileges
if (!isLoggedIn() || !hasPermission('VIEW_ANALYTICS')) {
    header('Location: ../login.php?redirect=' . urlencode($_SERVER['REQUEST_URI']));
    exit;
}

// Load feedback data
$feedbackDir = '../data/feedback';
$feedbackFiles = [];
if (is_dir($feedbackDir)) {
    $feedbackFiles = glob($feedbackDir . '/*.json');
}

$feedbackData = [];
foreach ($feedbackFiles as $file) {
    $data = json_decode(file_get_contents($file), true);
    if ($data) {
        $feedbackData[] = $data;
    }
}

// Sort feedback by submission time (newest first)
usort($feedbackData, function($a, $b) {
    return $b['submission_time'] <=> $a['submission_time'];
});

// Calculate average ratings
$averageRatings = [
    'overall' => 0,
    'navigation' => 0,
    'data_visualization' => 0,
    'error_monitoring' => 0,
    'security_features' => 0
];

$totalFeedback = count($feedbackData);
if ($totalFeedback > 0) {
    foreach ($feedbackData as $feedback) {
        $averageRatings['overall'] += $feedback['usability_rating']['overall'];
        $averageRatings['navigation'] += $feedback['usability_rating']['navigation'];
        $averageRatings['data_visualization'] += $feedback['usability_rating']['data_visualization'];
        $averageRatings['error_monitoring'] += $feedback['usability_rating']['error_monitoring'];
        $averageRatings['security_features'] += $feedback['usability_rating']['security_features'];
    }
    
    $averageRatings['overall'] /= $totalFeedback;
    $averageRatings['navigation'] /= $totalFeedback;
    $averageRatings['data_visualization'] /= $totalFeedback;
    $averageRatings['error_monitoring'] /= $totalFeedback;
    $averageRatings['security_features'] /= $totalFeedback;
}

// Calculate task completion rate
$taskCompletionRate = 0;
if ($totalFeedback > 0) {
    $completedTasks = 0;
    foreach ($feedbackData as $feedback) {
        if ($feedback['completed_tasks'] === 'Yes') {
            $completedTasks++;
        }
    }
    
    $taskCompletionRate = ($completedTasks / $totalFeedback) * 100;
}

// Extract common themes from feedback
function extractThemes($feedbackData, $field) {
    $allText = '';
    foreach ($feedbackData as $feedback) {
        if (!empty($feedback[$field])) {
            $allText .= $feedback[$field] . ' ';
        }
    }
    
    // Simple word frequency analysis
    $words = str_word_count(strtolower($allText), 1);
    $stopWords = ['the', 'and', 'a', 'to', 'of', 'in', 'is', 'it', 'that', 'for', 'on', 'with', 'as', 'was', 'be', 'are', 'this', 'an', 'by', 'not', 'or', 'but', 'at', 'from', 'have', 'had', 'has', 'i', 'you', 'they', 'we', 'would', 'could', 'should', 'can', 'will', 'very', 'just', 'more', 'some', 'any', 'all', 'there', 'their', 'what', 'when', 'who', 'how', 'which', 'where', 'why', 'if', 'so', 'no', 'yes', 'my', 'your', 'our', 'his', 'her', 'its', 'than', 'then', 'them', 'these', 'those', 'been', 'being', 'did', 'do', 'does', 'doing', 'done', 'get', 'got', 'getting', 'go', 'going', 'gone', 'went', 'make', 'made', 'making', 'see', 'saw', 'seeing', 'seen', 'take', 'took', 'taking', 'taken', 'come', 'came', 'coming', 'use', 'used', 'using', 'find', 'found', 'finding', 'give', 'gave', 'giving', 'given', 'think', 'thought', 'thinking', 'know', 'knew', 'knowing', 'known', 'want', 'wanted', 'wanting', 'need', 'needed', 'needing', 'like', 'liked', 'liking', 'look', 'looked', 'looking', 'seem', 'seemed', 'seeming', 'try', 'tried', 'trying', 'feel', 'felt', 'feeling', 'become', 'became', 'becoming', 'leave', 'left', 'leaving', 'put', 'putting', 'set', 'setting', 'show', 'showed', 'showing', 'shown', 'ask', 'asked', 'asking', 'work', 'worked', 'working', 'call', 'called', 'calling', 'follow', 'followed', 'following', 'let', 'letting', 'turn', 'turned', 'turning', 'help', 'helped', 'helping', 'talk', 'talked', 'talking', 'run', 'ran', 'running', 'move', 'moved', 'moving', 'live', 'lived', 'living', 'believe', 'believed', 'believing', 'bring', 'brought', 'bringing', 'happen', 'happened', 'happening', 'write', 'wrote', 'writing', 'written', 'sit', 'sat', 'sitting', 'stand', 'stood', 'standing', 'hear', 'heard', 'hearing', 'mean', 'meant', 'meaning', 'keep', 'kept', 'keeping', 'let', 'letting', 'begin', 'began', 'beginning', 'begun', 'seem', 'seemed', 'seeming', 'might', 'must', 'shall', 'may', 'about', 'many', 'most', 'other', 'such', 'only', 'own', 'same', 'few', 'too', 'also', 'well', 'however', 'now', 'then', 'still', 'even', 'here', 'there', 'again', 'already', 'often', 'never', 'always', 'sometimes', 'usually', 'ever', 'while', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'over', 'through', 'into', 'onto', 'within', 'without', 'along', 'across', 'behind', 'beyond', 'among', 'throughout', 'despite', 'except', 'until', 'upon', 'whether', 'though', 'although', 'since', 'because', 'therefore', 'hence', 'thus', 'accordingly', 'consequently', 'otherwise', 'instead', 'meanwhile', 'nonetheless', 'nevertheless', 'rather', 'furthermore', 'moreover', 'indeed', 'namely', 'specifically', 'especially', 'particularly', 'generally', 'usually', 'typically', 'actually', 'really', 'truly', 'basically', 'essentially', 'simply', 'clearly', 'obviously', 'apparently', 'possibly', 'probably', 'definitely', 'certainly', 'absolutely', 'completely', 'totally', 'entirely', 'fully', 'highly', 'extremely', 'quite', 'somewhat', 'slightly', 'barely', 'hardly', 'nearly', 'almost', 'exactly', 'precisely', 'approximately', 'roughly', 'around', 'about', 'overall', 'primarily', 'mainly', 'mostly', 'largely', 'chiefly', 'predominantly', 'principally', 'significantly', 'substantially', 'considerably', 'noticeably', 'markedly', 'relatively', 'comparatively', 'fairly', 'reasonably', 'moderately', 'adequately', 'sufficiently', 'enough', 'too', 'excessively', 'overly', 'unduly', 'unnecessarily', 'needlessly', 'pointlessly', 'uselessly', 'futilely', 'vainly', 'fruitlessly', 'ineffectively', 'unsuccessfully', 'effectively', 'successfully', 'efficiently', 'adequately', 'satisfactorily', 'acceptably', 'suitably', 'appropriately', 'properly', 'correctly', 'accurately', 'precisely', 'exactly', 'perfectly', 'ideally', 'optimally', 'maximally', 'minimally', 'marginally', 'partially', 'incompletely', 'insufficiently', 'inadequately', 'improperly', 'incorrectly', 'inaccurately', 'imprecisely', 'inexactly', 'imperfectly', 'suboptimally', 'submaximally', 'subminimally'];
    
    $wordFrequency = array_count_values($words);
    
    // Remove stop words
    foreach ($stopWords as $stopWord) {
        unset($wordFrequency[$stopWord]);
    }
    
    // Sort by frequency (highest first)
    arsort($wordFrequency);
    
    // Return top 10 words
    return array_slice($wordFrequency, 0, 10, true);
}

$usefulThemes = extractThemes($feedbackData, 'useful_features');
$difficultThemes = extractThemes($feedbackData, 'difficult_features');
$requestedThemes = extractThemes($feedbackData, 'requested_features');
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback Analysis - GigGatek Admin</title>
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
        .tag-cloud {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .tag {
            margin: 5px;
            padding: 5px 10px;
            border-radius: 20px;
            background-color: #f8f9fa;
            font-size: 1rem;
        }
    </style>
</head>
<body>
    <?php include '../includes/admin-navbar.php'; ?>
    
    <div class="container-fluid mt-4">
        <div class="row mb-4">
            <div class="col">
                <h1>User Testing Feedback Analysis</h1>
                <p>Analysis of feedback collected during user testing</p>
            </div>
            <div class="col-auto">
                <a href="user-testing-feedback.php" class="btn btn-primary">Provide Feedback</a>
            </div>
        </div>

        <?php if ($totalFeedback === 0): ?>
        <div class="alert alert-info">
            No feedback data available yet. Please conduct user testing to collect feedback.
        </div>
        <?php else: ?>
        
        <div class="row">
            <div class="col-md-3">
                <div class="card stat-card">
                    <div class="stat-value"><?php echo $totalFeedback; ?></div>
                    <div class="stat-label">Total Feedback</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card">
                    <div class="stat-value"><?php echo number_format($averageRatings['overall'], 1); ?></div>
                    <div class="stat-label">Average Overall Rating</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card">
                    <div class="stat-value"><?php echo number_format($taskCompletionRate, 1); ?>%</div>
                    <div class="stat-label">Task Completion Rate</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card">
                    <div class="stat-value"><?php echo count($feedbackFiles); ?></div>
                    <div class="stat-label">Feedback Files</div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Usability Ratings</h5>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="ratingsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Feedback by Role</h5>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="roleChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Useful Features</h5>
                    </div>
                    <div class="card-body">
                        <div class="tag-cloud">
                            <?php foreach ($usefulThemes as $word => $count): ?>
                            <div class="tag" style="font-size: <?php echo min(2, 0.8 + ($count / 5) * 0.8); ?>rem;">
                                <?php echo htmlspecialchars($word); ?> (<?php echo $count; ?>)
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Difficult Features</h5>
                    </div>
                    <div class="card-body">
                        <div class="tag-cloud">
                            <?php foreach ($difficultThemes as $word => $count): ?>
                            <div class="tag" style="font-size: <?php echo min(2, 0.8 + ($count / 5) * 0.8); ?>rem;">
                                <?php echo htmlspecialchars($word); ?> (<?php echo $count; ?>)
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Requested Features</h5>
                    </div>
                    <div class="card-body">
                        <div class="tag-cloud">
                            <?php foreach ($requestedThemes as $word => $count): ?>
                            <div class="tag" style="font-size: <?php echo min(2, 0.8 + ($count / 5) * 0.8); ?>rem;">
                                <?php echo htmlspecialchars($word); ?> (<?php echo $count; ?>)
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Individual Feedback</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Date</th>
                                        <th>Overall Rating</th>
                                        <th>Completed Tasks</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($feedbackData as $feedback): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($feedback['name']); ?></td>
                                        <td><?php echo htmlspecialchars($feedback['role']); ?></td>
                                        <td><?php echo htmlspecialchars($feedback['date']); ?></td>
                                        <td><?php echo $feedback['usability_rating']['overall']; ?> / 5</td>
                                        <td><?php echo htmlspecialchars($feedback['completed_tasks']); ?></td>
                                        <td>
                                            <button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#feedbackModal<?php echo $feedback['submission_time']; ?>">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Feedback Modals -->
        <?php foreach ($feedbackData as $feedback): ?>
        <div class="modal fade" id="feedbackModal<?php echo $feedback['submission_time']; ?>" tabindex="-1" aria-labelledby="feedbackModalLabel<?php echo $feedback['submission_time']; ?>" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="feedbackModalLabel<?php echo $feedback['submission_time']; ?>">Feedback from <?php echo htmlspecialchars($feedback['name']); ?></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Participant Information</h6>
                                <p><strong>Name:</strong> <?php echo htmlspecialchars($feedback['name']); ?></p>
                                <p><strong>Role:</strong> <?php echo htmlspecialchars($feedback['role']); ?></p>
                                <p><strong>Date:</strong> <?php echo htmlspecialchars($feedback['date']); ?></p>
                                
                                <h6>Usability Ratings</h6>
                                <p><strong>Overall:</strong> <?php echo $feedback['usability_rating']['overall']; ?> / 5</p>
                                <p><strong>Navigation:</strong> <?php echo $feedback['usability_rating']['navigation']; ?> / 5</p>
                                <p><strong>Data Visualization:</strong> <?php echo $feedback['usability_rating']['data_visualization']; ?> / 5</p>
                                <p><strong>Error Monitoring:</strong> <?php echo $feedback['usability_rating']['error_monitoring']; ?> / 5</p>
                                <p><strong>Security Features:</strong> <?php echo $feedback['usability_rating']['security_features']; ?> / 5</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Task Completion</h6>
                                <p><strong>Completed All Tasks:</strong> <?php echo htmlspecialchars($feedback['completed_tasks']); ?></p>
                                <?php if ($feedback['completed_tasks'] === 'No' && !empty($feedback['difficult_tasks'])): ?>
                                <p><strong>Difficult Tasks:</strong> <?php echo nl2br(htmlspecialchars($feedback['difficult_tasks'])); ?></p>
                                <?php endif; ?>
                            </div>
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-md-12">
                                <h6>Feature Feedback</h6>
                                <?php if (!empty($feedback['useful_features'])): ?>
                                <p><strong>Useful Features:</strong> <?php echo nl2br(htmlspecialchars($feedback['useful_features'])); ?></p>
                                <?php endif; ?>
                                
                                <?php if (!empty($feedback['difficult_features'])): ?>
                                <p><strong>Difficult Features:</strong> <?php echo nl2br(htmlspecialchars($feedback['difficult_features'])); ?></p>
                                <?php endif; ?>
                                
                                <?php if (!empty($feedback['requested_features'])): ?>
                                <p><strong>Requested Features:</strong> <?php echo nl2br(htmlspecialchars($feedback['requested_features'])); ?></p>
                                <?php endif; ?>
                            </div>
                        </div>
                        
                        <?php if (!empty($feedback['additional_comments'])): ?>
                        <div class="row mt-3">
                            <div class="col-md-12">
                                <h6>Additional Comments</h6>
                                <p><?php echo nl2br(htmlspecialchars($feedback['additional_comments'])); ?></p>
                            </div>
                        </div>
                        <?php endif; ?>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
        
        <?php endif; ?>
    </div>

    <script src="../js/jquery.min.js"></script>
    <script src="../js/bootstrap.bundle.min.js"></script>
    <script>
        <?php if ($totalFeedback > 0): ?>
        // Usability ratings chart
        const ratingsCtx = document.getElementById('ratingsChart').getContext('2d');
        const ratingsChart = new Chart(ratingsCtx, {
            type: 'radar',
            data: {
                labels: ['Overall', 'Navigation', 'Data Visualization', 'Error Monitoring', 'Security Features'],
                datasets: [{
                    label: 'Average Ratings',
                    data: [
                        <?php echo $averageRatings['overall']; ?>,
                        <?php echo $averageRatings['navigation']; ?>,
                        <?php echo $averageRatings['data_visualization']; ?>,
                        <?php echo $averageRatings['error_monitoring']; ?>,
                        <?php echo $averageRatings['security_features']; ?>
                    ],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(75, 192, 192, 1)'
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 5
                    }
                }
            }
        });
        
        // Role distribution chart
        const roleCtx = document.getElementById('roleChart').getContext('2d');
        
        // Count feedback by role
        const roleCounts = {};
        <?php foreach ($feedbackData as $feedback): ?>
        const role = '<?php echo addslashes($feedback['role']); ?>';
        roleCounts[role] = (roleCounts[role] || 0) + 1;
        <?php endforeach; ?>
        
        const roleChart = new Chart(roleCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(roleCounts),
                datasets: [{
                    data: Object.values(roleCounts),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(199, 199, 199, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
        <?php endif; ?>
    </script>
</body>
</html>
