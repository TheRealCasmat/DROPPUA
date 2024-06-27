<?php
include "db_connect.php";
// Check if the file is being uploaded
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $uploadDir = 'files/';
    if($_POST['type'] == 'upload') {
        // Get the file from the request
        $file = $_FILES['file'];
        // Get the file name
        $fileName = $_POST['name'];
        // Move the file to the files folder
        $filePath = $uploadDir . $fileName;
        move_uploaded_file($file["tmp_name"], $filePath);
        $sqlPath = './' . $filePath;
        $sql = "INSERT INTO content (type, value) VALUES ('fle', '$sqlPath')";
        $result = $mysqli->query($sql) or die(mysqli_error($mysqli));
        echo $fileName;
    }
    elseif($_POST['type'] == 'revert') {
        $id = $_POST['id'];
        $filePath = $uploadDir . $id;
        $sqlPath = './' . $filePath;
        $sql = "DELETE FROM content WHERE type = 'fle' AND value = '$sqlPath'";
        $result = $mysqli->query($sql) or die(mysqli_error($mysqli));
        unlink($filePath);
    }
    elseif($_POST['type'] == 'remove') {
        $sqlPath = $_POST['path'];
        $filePath = substr($sqlPath, 2);
        $sql = "DELETE FROM content WHERE type = 'fle' AND value = '$sqlPath'";
        $result = $mysqli->query($sql) or die(mysqli_error($mysqli));
        unlink($filePath);
    }
    elseif($_POST['type'] == 'updatetext') {
        $text = $_POST['text'];
        $sql = "UPDATE content SET value = '$text' WHERE type = 'txt'";
        $result = $mysqli->query($sql) or die(mysqli_error($mysqli));
    }
}
else {
    header("Location: index.html");
}
?>