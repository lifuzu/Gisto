'use strict';

function mainCtrl($scope, $http, appSettings, socket) {
    $scope.latestVersion = appSettings.get('latestVersion');
    $scope.currentVersion = '';
    $scope.updateAvailable = false;

    $scope.gotoSite = function () {
        gui.Shell.openExternal('http://www.gistoapp.com');
    };

    // get the current version number
    $http.get('./package.json').success(function (data) {
        $scope.currentVersion = data.version;
    });

    var timestamp = new Date().getTime() - 86400000; // 1 day ago
    if (!$scope.latestVersion || $scope.latestVersion.timestamp < timestamp) {
        console.log('save');
        // get the latest version number
        $http({
            url: 'https://api.github.com/repos/Gisto/Gisto/contents/app/package.json',
            headers: {
                Accept: "application/vnd.github.3.raw"
            },
            method: 'get'
        }).success(function (data) {
                appSettings.setOne('latestVersion', {version: data.version, timestamp: new Date().getTime() });
            });

    }

    $scope.$watch('currentVersion + latestVersion', function () {

        if ($scope.currentVersion && $scope.latestVersion && $scope.currentVersion !== $scope.latestVersion.version) {
            $scope.updateAvailable = true;
        }
    });

    socket.on("send:message", function (message) {
        $scope.message += message.data;
    });

    $scope.clean_message = function() {
        $scope.message = '';
    }

    $scope.clone_repo = function(message) {
        $scope.message = '';
        // send a clone message with options on an url
        socket.emit('clone', {data: 'helo'});
    };

    $scope.remove_local_repo = function(local_repo_folder_name) {
        $scope.message = '';
        // send a remove local repo command with option: local_repo_folder_name
        socket.emit('remove_local_repo', {local_repo_folder_name: local_repo_folder_name});
    };

    $scope.checkout = function(topic_branch_name) {
        $scope.message = '';
        // send a checkout topic branch command with option: topic_branch_name
        socket.emit('checkout', {local_repo_folder_name: 'bootstrap-examples', topic_branch_name: topic_branch_name, remote_mount_point: 'origin', remote_branch_name: 'master'});
    };
}