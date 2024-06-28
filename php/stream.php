<?php
include "db_connect.php";
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

// Get Text Value
$sql = "SELECT value FROM content WHERE type = 'txt'";
$result = $mysqli->query($sql);
$row = $result->fetch_assoc();
$text = $row['value'];

// Get File Paths
$sql = "SELECT value FROM content WHERE type = 'fle'";
$result = $mysqli->query($sql);
$files = array();
while ($row = $result->fetch_assoc()) {
    $files[] = $row['value'];
}

echo "data:" . base64_encode(json_encode(array(
    "text" => $text,
    "files" => $files
))) . "\n\n";
ob_flush();
flush();
?>