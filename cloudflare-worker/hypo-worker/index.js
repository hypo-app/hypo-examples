addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

function getCookie(request, name) {
  let cookie = request.headers.get('Cookie');
  if (!cookie) { return null; }
  let v = cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : null;
}

function setCookie(response, name, value, hours) {
  let d = new Date();
  d.setTime(d.getTime() + 60 * 60 * 1000 * hours);
  let newCookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
  if (options.cookieDomain) {
      newCookie += ";domain=" + options.cookieDomain;
  }
  response.headers.append('Set-Cookie', newCookie);
}

// Source - https://stackoverflow.com/a/8809472
function generateUUID() { // Public Domain/MIT
  let d = new Date().getTime();//Timestamp
  let d2 = 0;
  if (typeof performance !== 'undefined') {
    d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;//random number between 0 and 16
    if (d > 0) {//Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Source - https://stackoverflow.com/a/8809472
function generateUUID() { // Public Domain/MIT
    let d = new Date().getTime();//Timestamp
    let d2 = 0;
    if (typeof performance !== 'undefined') {
        d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

var VERSION = '0.0.1';
var options = {
    cookiePrefix: "hypo",
    baseUrl: "https://api.hypo.app",
    project: "development",
    userIdCookieDurationHours: 24 * 365 * 2,
    groupAssignmentCookieDurationHours: 6,
    cookieDomain: null,
    requestTimeoutMs: 5000
}

function withTimeout(fetchPromise) {
  const timerPromise = new Promise((resolve) => {
      setTimeout(resolve, options.requestTimeoutMs, { timeout: true });
  });
  return Promise.race([
      fetchPromise.then((val) => {
          return { value: val, timeout: false }
      }),
      timerPromise
  ]).then((val) => {
      if (val.timeout) {
          throw new Error("timeout");
      } else {
          return val.value;
      }
  });
}

function getGroupAssignment(userId, experimentId) {
  const url = `${options.baseUrl}/project/${options.project}/experiment/${experimentId}/group/assignment`;
  const body = JSON.stringify({
    user: userId
  });
  const headers = {
    'Content-Type': 'application/json',
    'X-Hypo-Client': 'js-cf-worker',
    'X-Hypo-Client-Version': VERSION,
  };
  return withTimeout(
    fetch(url, {
      method: "POST",
      headers: headers,
      body: body
    }).then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      } else {
        return response.json();
      }
    }).then((data) => {
      return data.group;
    })
  );
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const userIdCookieName = options.cookiePrefix + "-uid";
  let userId = getCookie(request, userIdCookieName);
  let setUserIdCookie = false;
  if (!userId) {
      userId = generateUUID();
      setUserIdCookie = true;
  }

  let experimentId = 'hypo-1';
  const experimentCookieName = options.cookiePrefix + "-eid-" + experimentId;
  let groupAssignment = getCookie(request, experimentCookieName);
  let setGroupAssignmentCookie = false;
  if (!groupAssignment) {
      groupAssignment = await getGroupAssignment(userId, experimentId);
      setGroupAssignmentCookie = true;
  }
  const response = new Response(groupAssignment, {
    headers: { 'content-type': 'text/plain' },
  });
  if (setUserIdCookie) {
    setCookie(response, userIdCookieName, userId, options.userIdCookieDurationHours);
  }
  if (setGroupAssignmentCookie) {
    setCookie(response, experimentCookieName, groupAssignment, options.groupAssignmentCookieDurationHours);
  }
  return response;
}
