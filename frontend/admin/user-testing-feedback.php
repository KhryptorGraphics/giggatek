<?php
/**
 * User Testing Feedback Form
 * 
 * This page allows users to provide feedback during user testing.
 */

// Include necessary files
require_once '../includes/header.php';
require_once '../includes/auth.php';

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Process form submission
    $feedback = [
        'name' => $_POST['name'] ?? '',
        'role' => $_POST['role'] ?? '',
        'date' => date('Y-m-d'),
        'usability_rating' => [
            'overall' => intval($_POST['overall_usability'] ?? 0),
            'navigation' => intval($_POST['navigation_usability'] ?? 0),
            'data_visualization' => intval($_POST['data_visualization_usability'] ?? 0),
            'error_monitoring' => intval($_POST['error_monitoring_usability'] ?? 0),
            'security_features' => intval($_POST['security_features_usability'] ?? 0)
        ],
        'useful_features' => $_POST['useful_features'] ?? '',
        'difficult_features' => $_POST['difficult_features'] ?? '',
        'requested_features' => $_POST['requested_features'] ?? '',
        'completed_tasks' => $_POST['completed_tasks'] ?? 'No',
        'difficult_tasks' => $_POST['difficult_tasks'] ?? '',
        'additional_comments' => $_POST['additional_comments'] ?? '',
        'submission_time' => time()
    ];
    
    // Save feedback to file
    $feedbackDir = '../data/feedback';
    if (!is_dir($feedbackDir)) {
        mkdir($feedbackDir, 0755, true);
    }
    
    $filename = $feedbackDir . '/feedback_' . time() . '_' . preg_replace('/[^a-z0-9]/i', '_', $feedback['name']) . '.json';
    file_put_contents($filename, json_encode($feedback, JSON_PRETTY_PRINT));
    
    // Set success message
    $_SESSION['flash_message'] = [
        'type' => 'success',
        'message' => 'Thank you for your feedback! Your input will help us improve the GigGatek platform.'
    ];
    
    // Redirect to prevent form resubmission
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Testing Feedback - GigGatek</title>
    <link rel="stylesheet" href="../css/bootstrap.min.css">
    <link rel="stylesheet" href="../css/admin.css">
    <style>
        .rating-group {
            display: flex;
            flex-direction: row-reverse;
            justify-content: flex-end;
        }
        .rating-group input {
            display: none;
        }
        .rating-group label {
            cursor: pointer;
            width: 30px;
            height: 30px;
            margin: 0 2px;
            background-size: 30px;
            background-repeat: no-repeat;
            transition: .2s;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='126.729' height='126.73'%3e%3cpath fill='%23e3e3e3' d='M121.215 44.212l-34.899-3.3c-2.2-.2-4.101-1.6-5-3.7l-12.5-30.3c-2-5-9.101-5-11.101 0l-12.4 30.3c-.8 2.1-2.8 3.5-5 3.7l-34.9 3.3c-5.2.5-7.3 7-3.4 10.5l26.3 23.1c1.7 1.5 2.4 3.7 1.9 5.9l-7.9 32.399c-1.2 5.101 4.3 9.3 8.9 6.601l29.1-17.101c1.9-1.1 4.2-1.1 6.1 0l29.101 17.101c4.6 2.699 10.1-1.4 8.899-6.601l-7.8-32.399c-.5-2.2.2-4.4 1.9-5.9l26.3-23.1c3.8-3.5 1.6-10-3.6-10.5z'/%3e%3c/svg%3e");
        }
        .rating-group input:checked ~ label,
        .rating-group input:hover ~ label {
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='126.729' height='126.73'%3e%3cpath fill='%23fcd93a' d='M121.215 44.212l-34.899-3.3c-2.2-.2-4.101-1.6-5-3.7l-12.5-30.3c-2-5-9.101-5-11.101 0l-12.4 30.3c-.8 2.1-2.8 3.5-5 3.7l-34.9 3.3c-5.2.5-7.3 7-3.4 10.5l26.3 23.1c1.7 1.5 2.4 3.7 1.9 5.9l-7.9 32.399c-1.2 5.101 4.3 9.3 8.9 6.601l29.1-17.101c1.9-1.1 4.2-1.1 6.1 0l29.101 17.101c4.6 2.699 10.1-1.4 8.899-6.601l-7.8-32.399c-.5-2.2.2-4.4 1.9-5.9l26.3-23.1c3.8-3.5 1.6-10-3.6-10.5z'/%3e%3c/svg%3e");
        }
    </style>
</head>
<body>
    <?php include '../includes/admin-navbar.php'; ?>
    
    <div class="container mt-4">
        <div class="row">
            <div class="col-md-12">
                <h1>User Testing Feedback</h1>
                <p class="lead">Thank you for participating in our user testing. Please provide your feedback below.</p>
                
                <?php displayFlashMessage(); ?>
                
                <div class="card">
                    <div class="card-body">
                        <form method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">
                            <h4>Participant Information</h4>
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="name" class="form-label">Name</label>
                                        <input type="text" class="form-control" id="name" name="name" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="role" class="form-label">Role</label>
                                        <select class="form-select" id="role" name="role" required>
                                            <option value="">Select your role</option>
                                            <option value="Developer">Developer</option>
                                            <option value="Product Manager">Product Manager</option>
                                            <option value="Security Specialist">Security Specialist</option>
                                            <option value="API Consumer">API Consumer</option>
                                            <option value="System Administrator">System Administrator</option>
                                            <option value="Stakeholder">Stakeholder</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <h4>Usability Rating</h4>
                            <p class="text-muted">Rate the following aspects from 1 (poor) to 5 (excellent)</p>
                            
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Overall Usability</label>
                                        <div class="rating-group">
                                            <?php for ($i = 5; $i >= 1; $i--): ?>
                                            <input type="radio" id="overall_usability_<?php echo $i; ?>" name="overall_usability" value="<?php echo $i; ?>" <?php echo $i === 3 ? 'checked' : ''; ?>>
                                            <label for="overall_usability_<?php echo $i; ?>" title="<?php echo $i; ?> stars"></label>
                                            <?php endfor; ?>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Navigation</label>
                                        <div class="rating-group">
                                            <?php for ($i = 5; $i >= 1; $i--): ?>
                                            <input type="radio" id="navigation_usability_<?php echo $i; ?>" name="navigation_usability" value="<?php echo $i; ?>" <?php echo $i === 3 ? 'checked' : ''; ?>>
                                            <label for="navigation_usability_<?php echo $i; ?>" title="<?php echo $i; ?> stars"></label>
                                            <?php endfor; ?>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Data Visualization</label>
                                        <div class="rating-group">
                                            <?php for ($i = 5; $i >= 1; $i--): ?>
                                            <input type="radio" id="data_visualization_usability_<?php echo $i; ?>" name="data_visualization_usability" value="<?php echo $i; ?>" <?php echo $i === 3 ? 'checked' : ''; ?>>
                                            <label for="data_visualization_usability_<?php echo $i; ?>" title="<?php echo $i; ?> stars"></label>
                                            <?php endfor; ?>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Error Monitoring</label>
                                        <div class="rating-group">
                                            <?php for ($i = 5; $i >= 1; $i--): ?>
                                            <input type="radio" id="error_monitoring_usability_<?php echo $i; ?>" name="error_monitoring_usability" value="<?php echo $i; ?>" <?php echo $i === 3 ? 'checked' : ''; ?>>
                                            <label for="error_monitoring_usability_<?php echo $i; ?>" title="<?php echo $i; ?> stars"></label>
                                            <?php endfor; ?>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Security Features</label>
                                        <div class="rating-group">
                                            <?php for ($i = 5; $i >= 1; $i--): ?>
                                            <input type="radio" id="security_features_usability_<?php echo $i; ?>" name="security_features_usability" value="<?php echo $i; ?>" <?php echo $i === 3 ? 'checked' : ''; ?>>
                                            <label for="security_features_usability_<?php echo $i; ?>" title="<?php echo $i; ?> stars"></label>
                                            <?php endfor; ?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <h4>Feature Feedback</h4>
                            <div class="mb-4">
                                <div class="mb-3">
                                    <label for="useful_features" class="form-label">What features did you find most useful?</label>
                                    <textarea class="form-control" id="useful_features" name="useful_features" rows="3"></textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="difficult_features" class="form-label">What features were difficult to use or understand?</label>
                                    <textarea class="form-control" id="difficult_features" name="difficult_features" rows="3"></textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="requested_features" class="form-label">What features would you like to see added?</label>
                                    <textarea class="form-control" id="requested_features" name="requested_features" rows="3"></textarea>
                                </div>
                            </div>
                            
                            <h4>Task Completion</h4>
                            <div class="mb-4">
                                <div class="mb-3">
                                    <label class="form-label">Were you able to complete all the tasks?</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="completed_tasks" id="completed_tasks_yes" value="Yes">
                                        <label class="form-check-label" for="completed_tasks_yes">Yes</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="completed_tasks" id="completed_tasks_no" value="No" checked>
                                        <label class="form-check-label" for="completed_tasks_no">No</label>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="difficult_tasks" class="form-label">If no, which tasks were difficult or impossible?</label>
                                    <textarea class="form-control" id="difficult_tasks" name="difficult_tasks" rows="3"></textarea>
                                </div>
                            </div>
                            
                            <h4>Additional Comments</h4>
                            <div class="mb-4">
                                <div class="mb-3">
                                    <textarea class="form-control" id="additional_comments" name="additional_comments" rows="5"></textarea>
                                </div>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary">Submit Feedback</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="../js/jquery.min.js"></script>
    <script src="../js/bootstrap.bundle.min.js"></script>
</body>
</html>
