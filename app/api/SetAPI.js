export default class SetAPI {
    static request_access = (setId, request_body, callback) => {
        let url = _config.SET_API_BASE + "/";
        url += "sets/" + setId + "/request_access";

        let method = "POST";

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const respData = JSON.parse(xhr.responseText);
                    if (respData && !respData.error) {
                        callback(respData);
                    } else {
                        callback(null);
                    }
                } else {
                    callback(null);
                }
            }
        };
        xhr.open(method, url);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(request_body));
    };

}