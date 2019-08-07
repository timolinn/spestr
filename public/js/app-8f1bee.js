! function () {
    var require = function (file, cwd) {
        var resolved = require.resolve(file, cwd || "/"),
            mod = require.modules[resolved];
        if (!mod) throw new Error("Failed to resolve module " + file + ", tried " + resolved);
        var cached = require.cache[resolved],
            res = cached ? cached.exports : mod();
        return res
    };
    require.paths = [], require.modules = {}, require.cache = {}, require.extensions = [".js", ".coffee", ".json"], require._core = {
            assert: !0,
            events: !0,
            fs: !0,
            path: !0,
            vm: !0
        }, require.resolve = function () {
            return function (x, cwd) {
                function loadAsFileSync(x) {
                    if (x = path.normalize(x), require.modules[x]) return x;
                    for (var i = 0; i < require.extensions.length; i++) {
                        var ext = require.extensions[i];
                        if (require.modules[x + ext]) return x + ext
                    }
                }

                function loadAsDirectorySync(x) {
                    x = x.replace(/\/+$/, "");
                    var pkgfile = path.normalize(x + "/package.json");
                    if (require.modules[pkgfile]) {
                        var pkg = require.modules[pkgfile](),
                            b = pkg.browserify;
                        if ("object" == typeof b && b.main) {
                            var m = loadAsFileSync(path.resolve(x, b.main));
                            if (m) return m
                        } else if ("string" == typeof b) {
                            var m = loadAsFileSync(path.resolve(x, b));
                            if (m) return m
                        } else if (pkg.main) {
                            var m = loadAsFileSync(path.resolve(x, pkg.main));
                            if (m) return m
                        }
                    }
                    return loadAsFileSync(x + "/index")
                }

                function loadNodeModulesSync(x, start) {
                    for (var dirs = nodeModulesPathsSync(start), i = 0; i < dirs.length; i++) {
                        var dir = dirs[i],
                            m = loadAsFileSync(dir + "/" + x);
                        if (m) return m;
                        var n = loadAsDirectorySync(dir + "/" + x);
                        if (n) return n
                    }
                    var m = loadAsFileSync(x);
                    return m ? m : void 0
                }

                function nodeModulesPathsSync(start) {
                    var parts;
                    parts = "/" === start ? [""] : path.normalize(start).split("/");
                    for (var dirs = [], i = parts.length - 1; i >= 0; i--)
                        if ("node_modules" !== parts[i]) {
                            var dir = parts.slice(0, i + 1).join("/") + "/node_modules";
                            dirs.push(dir)
                        } return dirs
                }
                if (cwd || (cwd = "/"), require._core[x]) return x;
                var path = require.modules.path();
                cwd = path.resolve("/", cwd);
                var y = cwd || "/";
                if (x.match(/^(?:\.\.?\/|\/)/)) {
                    var m = loadAsFileSync(path.resolve(y, x)) || loadAsDirectorySync(path.resolve(y, x));
                    if (m) return m
                }
                var n = loadNodeModulesSync(x, y);
                if (n) return n;
                throw new Error("Cannot find module '" + x + "'")
            }
        }(), require.alias = function (from, to) {
            var path = require.modules.path(),
                res = null;
            try {
                res = require.resolve(from + "/package.json", "/")
            } catch (err) {
                res = require.resolve(from, "/")
            }
            for (var basedir = path.dirname(res), keys = (Object.keys || function (obj) {
                    var res = [];
                    for (var key in obj) res.push(key);
                    return res
                })(require.modules), i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (key.slice(0, basedir.length + 1) === basedir + "/") {
                    var f = key.slice(basedir.length);
                    require.modules[to + f] = require.modules[basedir + f]
                } else key === basedir && (require.modules[to] = require.modules[basedir])
            }
        },
        function () {
            var process = {},
                global = "undefined" != typeof window ? window : {},
                definedProcess = !1;
            require.define = function (filename, fn) {
                !definedProcess && require.modules.__browserify_process && (process = require.modules.__browserify_process(), definedProcess = !0);
                var dirname = require._core[filename] ? "" : require.modules.path().dirname(filename),
                    require_ = function (file) {
                        var requiredModule = require(file, dirname),
                            cached = require.cache[require.resolve(file, dirname)];
                        return cached && null === cached.parent && (cached.parent = module_), requiredModule
                    };
                require_.resolve = function (name) {
                    return require.resolve(name, dirname)
                }, require_.modules = require.modules, require_.define = require.define, require_.cache = require.cache;
                var module_ = {
                    id: filename,
                    filename: filename,
                    exports: {},
                    loaded: !1,
                    parent: null
                };
                require.modules[filename] = function () {
                    return require.cache[filename] = module_, fn.call(module_.exports, require_, module_, module_.exports, dirname, filename, process, global), module_.loaded = !0, module_.exports
                }
            }
        }(), require.define("path", function (require, module, exports, __dirname, __filename, process) {
            function filter(xs, fn) {
                for (var res = [], i = 0; i < xs.length; i++) fn(xs[i], i, xs) && res.push(xs[i]);
                return res
            }

            function normalizeArray(parts, allowAboveRoot) {
                for (var up = 0, i = parts.length; i >= 0; i--) {
                    var last = parts[i];
                    "." == last ? parts.splice(i, 1) : ".." === last ? (parts.splice(i, 1), up++) : up && (parts.splice(i, 1), up--)
                }
                if (allowAboveRoot)
                    for (; up--; up) parts.unshift("..");
                return parts
            }
            var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;
            exports.resolve = function () {
                for (var resolvedPath = "", resolvedAbsolute = !1, i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
                    var path = i >= 0 ? arguments[i] : process.cwd();
                    "string" == typeof path && path && (resolvedPath = path + "/" + resolvedPath, resolvedAbsolute = "/" === path.charAt(0))
                }
                return resolvedPath = normalizeArray(filter(resolvedPath.split("/"), function (p) {
                    return !!p
                }), !resolvedAbsolute).join("/"), (resolvedAbsolute ? "/" : "") + resolvedPath || "."
            }, exports.normalize = function (path) {
                var isAbsolute = "/" === path.charAt(0),
                    trailingSlash = "/" === path.slice(-1);
                return path = normalizeArray(filter(path.split("/"), function (p) {
                    return !!p
                }), !isAbsolute).join("/"), path || isAbsolute || (path = "."), path && trailingSlash && (path += "/"), (isAbsolute ? "/" : "") + path
            }, exports.join = function () {
                var paths = Array.prototype.slice.call(arguments, 0);
                return exports.normalize(filter(paths, function (p) {
                    return p && "string" == typeof p
                }).join("/"))
            }, exports.dirname = function (path) {
                var dir = splitPathRe.exec(path)[1] || "",
                    isWindows = !1;
                return dir ? 1 === dir.length || isWindows && dir.length <= 3 && ":" === dir.charAt(1) ? dir : dir.substring(0, dir.length - 1) : "."
            }, exports.basename = function (path, ext) {
                var f = splitPathRe.exec(path)[2] || "";
                return ext && f.substr(-1 * ext.length) === ext && (f = f.substr(0, f.length - ext.length)), f
            }, exports.extname = function (path) {
                return splitPathRe.exec(path)[3] || ""
            }
        }), require.define("__browserify_process", function (require, module, exports, __dirname, __filename, process) {
            var process = module.exports = {};
            process.nextTick = function () {
                    var canSetImmediate = "undefined" != typeof window && window.setImmediate,
                        canPost = "undefined" != typeof window && window.postMessage && window.addEventListener;
                    if (canSetImmediate) return function (f) {
                        return window.setImmediate(f)
                    };
                    if (canPost) {
                        var queue = [];
                        return window.addEventListener("message", function (ev) {
                                if (ev.source === window && "browserify-tick" === ev.data && (ev.stopPropagation(), queue.length > 0)) {
                                    var fn = queue.shift();
                                    fn()
                                }
                            }, !0),
                            function (fn) {
                                queue.push(fn), window.postMessage("browserify-tick", "*")
                            }
                    }
                    return function (fn) {
                        setTimeout(fn, 0)
                    }
                }(), process.title = "browser", process.browser = !0, process.env = {}, process.argv = [], process.binding = function (name) {
                    if ("evals" === name) return require("vm");
                    throw new Error("No such module. (Possibly not yet loaded)")
                },
                function () {
                    var path, cwd = "/";
                    process.cwd = function () {
                        return cwd
                    }, process.chdir = function (dir) {
                        path || (path = require("path")), cwd = path.resolve(dir, cwd)
                    }
                }()
        }), require.define("/app/aggregator/stableMovingAverage.js", function (require, module) {
            module.exports = function (windowSize, snapshotResetThreshold) {
                function reset() {
                    startInd = 0, curSpeed = 0, lastLen = 0, bytes = 0, times = 0, fixedStartInd = !1
                }

                function movingAvg(snapshots) {
                    snapshots.length < snapshotResetThreshold && reset(), lastLen = snapshots.length;
                    var snapshotInd, speed;
                    if (!fixedStartInd) {
                        var sumBytes = 0,
                            sumTime = 0,
                            start = snapshots.length - 1,
                            end = Math.max(0, snapshots.length - windowSize);
                        for (snapshotInd = start; snapshotInd >= end; --snapshotInd) snapshot = snapshots[snapshotInd], sumBytes += snapshot.bytes, sumTime += snapshot.time;
                        speed = sumTime > 0 ? sumBytes / sumTime : 0, speed >= curSpeed ? (startInd = start + 1, curSpeed = speed, bytes = sumBytes, times = sumTime) : fixedStartInd = !0
                    }
                    for (snapshotInd = startInd; snapshotInd < snapshots.length; ++snapshotInd) snapshot = snapshots[snapshotInd], bytes += snapshot.bytes, times += snapshot.time;
                    return startInd = snapshots.length, times > 0 ? 1e3 * bytes * 8 / times : 0
                }
                var startInd, curSpeed, fixedStartInd, lastLen, bytes, times;
                return snapshotResetThreshold = snapshotResetThreshold || 5, reset(), movingAvg
            }
        }), require.define("/app/stopper/stableDeltaMeasurementsStopper.js", function (require, module) {
            module.exports = function (config) {
                function lastWindowMaxInd(measurements, windowSize) {
                    var measurement, curMaxSpeed = 0,
                        curMaxInd = 0,
                        measurementInd = 0,
                        numMeasurements = measurements.length,
                        firstMeasurementInd = Math.max(0, numMeasurements - windowSize);
                    for (measurementInd = numMeasurements - 1; measurementInd >= firstMeasurementInd; --measurementInd) measurement = measurements[measurementInd], measurement.speed >= curMaxSpeed && (curMaxSpeed = measurement.speed, curMaxInd = measurementInd);
                    return curMaxInd
                }

                function maxDelta(value, measurements) {
                    var measurementInd, delta, maxDelta = 0;
                    for (measurementInd = 0; measurementInd < measurements.length; ++measurementInd) delta = 100 * Math.abs(measurements[measurementInd].speed - value) / value, delta > maxDelta && (maxDelta = delta);
                    return maxDelta
                }

                function isCompleted(metrics) {
                    var maxInd, delta, testTime = void 0 !== metrics.testTime ? metrics.testTime : timer() - startTime,
                        measurements = metrics.progressMeasurements,
                        afterCompleteDuration = metrics.afterCompleteDuration,
                        numMeasurements = measurements.length,
                        curSpeed = metrics.speed;
                    return void 0 === afterCompleteDuration ? testTime >= maxDuration ? !0 : minStableMeasurements > numMeasurements ? !1 : (maxInd = lastWindowMaxInd(measurements, Math.ceil(minStableMeasurements / 2)), numMeasurements - maxInd < Math.ceil(minStableMeasurements / 2) ? !1 : (maxInd = Math.max(0, numMeasurements - minStableMeasurements), minStableMeasurements > numMeasurements - maxInd ? !1 : (delta = maxDelta(curSpeed, measurements.slice(numMeasurements - minStableMeasurements, numMeasurements)), delta > stabilityDelta ? !1 : testTime >= minDuration))) : testTime >= afterCompleteDuration
                }
                var minDuration, maxDuration, stabilityDelta, minStableMeasurements, timer, startTime;
                return minDuration = config.minDuration || 5, maxDuration = config.maxDuration || 60, stabilityDelta = config.stabilityDelta || 5, minStableMeasurements = config.minStableMeasurements || 5, timer = config.timer || require("../timer").time, startTime = timer(), isCompleted
            }
        }), require.define("/app/timer.js", function (require, module) {
            module.exports = function () {
                var timer;
                return this.window && window.performance && (timer = window.performance.now || window.performance.webkitNow, timer && (timer = timer.bind(window.performance))), timer || (timer = function () {
                    return (new Date).getTime()
                }), {
                    time: timer
                }
            }()
        }), require.define("/app/tester.js", function (require, module) {
            var tester = function () {
                var MAX_PAYLOAD_BYTES = 26214400,
                    MIN_REQUEST_SIZE = 1024,
                    STABLE_MEASUREMENTS_THRESHOLD = 10,
                    TEST_TYPE = {
                        DOWNLOAD_TEST: "download",
                        UPLOAD_TEST: "upload",
                        LATENCY_TEST: "latency"
                    },
                    utils = require("./utils"),
                    errors = require("./error"),
                    events = require("./event"),
                    testConfig = require("./config"),
                    factory = (require("circular-buffer"), function (requester, config) {
                        function validateEvent(eventName, callback) {
                            if (void 0 === events.schema[eventName]) throw new errors.TesterEventError("no event with name " + eventName);
                            if (!utils.isFunction(callback)) throw new errors.TesterEventError("function callback is expected for event " + eventName)
                        }

                        function isActive() {
                            return testIsRunning
                        }

                        function stop() {
                            var reqId;
                            testIsRunning = !1, urlGetter.stop(), reportTimeout && clearTimeout(reportTimeout), retryTimeout && clearTimeout(retryTimeout);
                            for (reqId in requesters) requesters[reqId].stop(), pingers[reqId].stop()
                        }

                        function reset() {
                            isActive() && stop(), startTime = null, downloadStartTime = null, testAttempt = 1, workerMeasurements = {}, latencyMeasurements = {}, requesters = {}, pingers = {}, progressMeasurements = [], requestTimeMs = config.startRangeRequestTimeMs, activeWorkersCount = 0, snapshot.reset(), window && window.performance && window.performance.clearResourceTimings && window.performance.clearResourceTimings()
                        }

                        function computeLoadedLatency() {
                            var reqId, value, latencies = [],
                                count = 0;
                            for (reqId in latencyMeasurements) latencyMeasurements[reqId].length > 4 && (value = utils.percentile(latencyMeasurements[reqId], .75), latencies.push(value)), count += latencyMeasurements[reqId].length;
                            if (0 === latencies.length)
                                for (reqId in latencyMeasurements) value = utils.percentile(latencyMeasurements[reqId], .75), latencies.push(value);
                            return {
                                value: Math.min.apply(null, latencies),
                                count: count
                            }
                        }

                        function computeUnloadedLatency() {
                            var reqId, value, latencies = [],
                                count = 0;
                            for (reqId in latencyMeasurements) value = utils.percentile(latencyMeasurements[reqId], .1), latencies.push(value), count += latencyMeasurements[reqId].length;
                            return {
                                value: Math.min.apply(null, latencies),
                                count: count
                            }
                        }

                        function reportEndEvents(data) {
                            var eventData, result = data.result,
                                resultValue = -1;
                            eventData = {
                                start: startTime,
                                downloadStart: downloadStartTime,
                                attempts: testAttempt,
                                numberOfTests: stats[currentTestType].tests,
                                bytes: stats[currentTestType].bytes[stats[currentTestType].bytes.length - 1]
                            }, "success" === result ? (eventData.stable = data.stable, currentTestType === TEST_TYPE.LATENCY_TEST ? (resultValue = data.value, eventData.count = data.count, eventData.value = resultValue) : (resultValue = data.speed, eventData.speed = resultValue, eventData.latency = computeLoadedLatency()), event(events.events.ATTEMPT_SUCCESS, eventData), event(events.events.SUCCESS, eventData), eventData.result = result) : "stop" === result ? (eventData.reason = data.reason || "stopped", event(events.events.STOP, eventData), eventData.result = result) : (eventData.error = data.error, eventData.attempts = testAttempt - 1, event(events.events.ATTEMPT_FAIL, eventData), event(events.events.FAIL, eventData), eventData.result = result), event(events.events.ATTEMPT_END, eventData), event(events.events.END, eventData), stats[currentTestType].results.push(resultValue)
                        }

                        function startTestWorker(workerId, url, attempt) {
                            function sendLatencyRequest(onLatencyComplete) {
                                var rangeUrl = url.replace("/range/", "/range/0-0");
                                event(events.events.LATENCY_START, {
                                    oca: oca
                                }), pinger.upload(rangeUrl, 0, utils.dummy, onLatencyComplete)
                            }

                            function sendDownloadRequest(onDownloadProgress, onDownloadComplete) {
                                var rangeUrl;
                                3 > testAttempt || config.maxBytesInFlight - 1 < activeWorkersCount * MAX_PAYLOAD_BYTES || !req.supportsProgress() ? rangeUrl = url.replace("/range/", "/range/0-" + requestSize) : (rangeUrl = url.replace("/range/", ""), requestSize = MAX_PAYLOAD_BYTES), event(events.events.CONNECTION_START, {
                                    oca: oca,
                                    range: requestSize,
                                    requestUrl: rangeUrl
                                });
                                try {
                                    req.start(rangeUrl, onDownloadProgress, onDownloadComplete, !1, url)
                                } catch (e) {
                                    onDownloadComplete({
                                        success: !1,
                                        response: {
                                            type: "Requester error",
                                            message: e
                                        }
                                    })
                                }
                            }

                            function sendUploadRequest(onUploadProgress, onUploadComplete) {
                                var rangeUrl;
                                3 > testAttempt || config.maxBytesInFlight - 1 < activeWorkersCount * MAX_PAYLOAD_BYTES || !req.supportsProgress() ? rangeUrl = url.replace("/range/", "/range/0-" + requestSize) : (rangeUrl = url.replace("/range/", ""), requestSize = MAX_PAYLOAD_BYTES), event(events.events.CONNECTION_START, {
                                    oca: oca,
                                    range: requestSize,
                                    requestUrl: rangeUrl
                                });
                                try {
                                    req.upload(rangeUrl, requestSize, onUploadProgress, onUploadComplete)
                                } catch (e) {
                                    onUploadComplete({
                                        success: !1,
                                        response: {
                                            type: "Requester error",
                                            message: e
                                        }
                                    })
                                }
                            }

                            function workerIsActive() {
                                return void 0 !== workerMeasurements[workerId]
                            }

                            function onProgress(progress) {
                                var progressData;
                                workerIsActive() && isActive() ? progress.success && (progressData = {
                                    bytes: progress.bytes,
                                    time: progress.end - progress.start,
                                    start: progress.start,
                                    end: progress.end
                                }, void 0 === progressData.bytes && (progressData.bytes = requestSize), stats[currentTestType].bytes[stats[currentTestType].bytes.length - 1] += progressData.bytes, workerMeasurements[workerId].push(progressData), event(events.events.CONNECTION_PROGRESS, {
                                    oca: oca,
                                    bytes: progressData.bytes,
                                    start: progressData.start,
                                    end: progressData.end
                                })) : req.stop()
                            }

                            function onComplete(sendRequest) {
                                var completeFunc = function (data) {
                                    var requestTime, eventData = {
                                            oca: oca
                                        },
                                        partialSuccess = !1;
                                    if (workerIsActive() && isActive() && "stopped" !== data.reason) {
                                        if (partialSuccess = !data.success && workerMeasurements[workerId].length > 0, !data.success && !partialSuccess) {
                                            var error = new errors.DownloadOcaDataError("Could not download oca data");
                                            return error.url = url, error.response = data.response, eventData.error = error, event(events.events.CONNECTION_FAIL, eventData), eventData.result = "fail", event(events.events.CONNECTION_END, eventData), void test(attempt + 1, error)
                                        }
                                        eventData.bytes = requestSize, eventData.partialSuccess = partialSuccess, event(events.events.CONNECTION_SUCCESS, eventData), eventData.result = "success", req.supportsProgress() ? requestSize = MAX_PAYLOAD_BYTES : (requestTime = data.end - data.start, requestSize = Math.min(Math.floor(requestTimeMs * requestSize / requestTime), 5 * requestSize, MAX_PAYLOAD_BYTES, Math.round(config.maxBytesInFlight / config.connections.max)), requestTimeMs = Math.min(requestTimeMs + config.rangeRequestIncreaseMs, config.maxRangeRequestTimeMs), requestSize = Math.max(requestSize, MIN_REQUEST_SIZE)), event(events.events.CONNECTION_END, eventData), sendRequest(onProgress, completeFunc)
                                    } else req.stop(), eventData.reason = "inactive", eventData.result = "stop", event(events.events.CONNECTION_END, eventData)
                                };
                                return completeFunc
                            }

                            function onLatencyComplete(data) {
                                var latency, scheduleDelay, eventData = {
                                    oca: oca
                                };
                                if (workerIsActive() && isActive() && "stopped" !== data.reason) {
                                    if (data.success) latency = data.end - data.start, data.timing || (latency /= 2), eventData.latency = latency, eventData.start = data.start, eventData.end = data.end, latencyMeasurements[workerId].push(latency), eventData.timing = data.timing, event(events.events.LATENCY_SUCCESS, eventData), eventData.result = "success";
                                    else {
                                        var error = new errors.DownloadOcaDataError("Could not measure latency to oca " + oca);
                                        error.url = url, error.response = data.response, eventData.error = error, event(events.events.LATENCY_FAIL, eventData), eventData.result = "fail"
                                    }
                                    event(events.events.LATENCY_END, eventData), scheduleDelay = currentTestType !== TEST_TYPE.LATENCY_TEST ? latency ? Math.max(config.latencyMeasurementsFrequencyMs - latency, 0) : config.latencyMeasurementsFrequencyMs : 0, setTimeout(function () {
                                        return sendLatencyRequest(onLatencyComplete)
                                    }, scheduleDelay)
                                } else pinger.stop(), eventData.reason = "inactive", eventData.result = "stop", event(events.events.LATENCY_END, eventData)
                            }
                            var req = requester(),
                                pinger = requester(),
                                requestSize = config.firstRequestBytes,
                                oca = url.split("/")[2];
                            requesters[workerId] = req, pingers[workerId] = pinger, workerMeasurements[workerId] = [], latencyMeasurements[workerId] = [], req.supportsProgress() && (requestSize = MAX_PAYLOAD_BYTES), config.measureLatency && currentTestType !== TEST_TYPE.LATENCY_TEST && sendLatencyRequest(onLatencyComplete), currentTestType === TEST_TYPE.DOWNLOAD_TEST ? sendDownloadRequest(onProgress, onComplete(sendDownloadRequest)) : currentTestType === TEST_TYPE.UPLOAD_TEST ? sendUploadRequest(onProgress, onComplete(sendUploadRequest)) : currentTestType === TEST_TYPE.LATENCY_TEST && sendLatencyRequest(onLatencyComplete)
                        }

                        function reportMetrics(interval) {
                            function testTime() {
                                var now = timer();
                                return (now - (downloadStartTime || startTime)) / 1e3
                            }
                            var latestSnapshot, resultData, testComplete, currentSpeed, snapshots, testTimeS, activeSnapshot = !1;
                            if (isActive())
                                if (currentTestType === TEST_TYPE.LATENCY_TEST) resultData = computeUnloadedLatency(), resultData.stable = !0, testComplete = testTime() > 5 && resultData.count > 50, testComplete ? (stop(), resultData.result = "success", setTimeout(function () {
                                    reportEndEvents(resultData)
                                }, 10)) : (event(events.events.PROGRESS, resultData), reportTimeout = setTimeout(function () {
                                    reportMetrics(interval)
                                }, interval));
                                else {
                                    latestSnapshot = snapshot.compute(workerMeasurements), latestSnapshot && (activeSnapshot = latestSnapshot.end - latestSnapshot.start > 0, event(events.events.SNAPSHOT, {
                                        bytes: latestSnapshot.bytes,
                                        start: latestSnapshot.start,
                                        end: latestSnapshot.end,
                                        time: latestSnapshot.time
                                    })), snapshots = snapshot.all(), testTimeS = testTime(), activeSnapshot && (currentSpeed = speedAggregator(snapshots), testComplete = testTimeS > config.duration.min && stopper({
                                        testTime: testTimeS,
                                        snapshots: snapshots,
                                        progressMeasurements: progressMeasurements,
                                        speed: currentSpeed
                                    })), testTimeS > config.duration.max && (testComplete = !0, currentSpeed = speedAggregator(snapshots)), resultData = {
                                        speed: currentSpeed,
                                        stable: !0,
                                        bytes: stats[currentTestType].bytes[stats[currentTestType].bytes.length - 1],
                                        latency: computeLoadedLatency()
                                    }, testComplete ? (testTimeS > config.duration.max && (resultData.stopperStable = !1, progressMeasurements.length > STABLE_MEASUREMENTS_THRESHOLD && (resultData.stable = !0)), stop(), resultData.result = "success", setTimeout(function () {
                                        reportEndEvents(resultData)
                                    }, 10)) : (activeSnapshot && (progressMeasurements.push({
                                        speed: currentSpeed
                                    }), event(events.events.PROGRESS, {
                                        speed: currentSpeed,
                                        bytes: resultData.bytes,
                                        latency: resultData.latency
                                    })), reportTimeout = setTimeout(function () {
                                        reportMetrics(interval)
                                    }, interval));
                                    var i, desiredWorkers = activeWorkersCount;
                                    if (activeWorkersCount < config.connections.max)
                                        for (currentSpeed > 5e7 ? desiredWorkers = config.connections.max : currentSpeed > 1e7 && 5 > activeWorkersCount ? desiredWorkers = 5 : currentSpeed > 1e6 && 3 > activeWorkersCount && (desiredWorkers = 3), currentSpeed > 5e5 && 2 > activeWorkersCount && (desiredWorkers = 3), i = 0; desiredWorkers - activeWorkersCount > i; ++i) startNewWorker()
                                }
                        }

                        function urlRequestFailure(error) {
                            event(events.events.URL_REQUEST_END, {
                                error: error,
                                result: "fail"
                            }), isActive() && test(testAttempt + 1, error)
                        }

                        function urlRequestStop() {
                            event(events.events.URL_REQUEST_END, {
                                result: "stop"
                            })
                        }

                        function startNewWorker() {
                            function startForUrl(url) {
                                var id = uniqueId();
                                event(events.events.URL_REQUEST_END, {
                                    url: url,
                                    result: "success",
                                    client: urlGetter.clientInfo()
                                }), downloadStartTime = downloadStartTime || timer(), startTestWorker(id, url, testAttempt)
                            }

                            function restartTest(error) {
                                return urlRequestFailure(error)
                            }
                            activeWorkersCount += 1, event(events.events.URL_REQUEST_START, config.getTestOcasParams), urlGetter.getNext(config.getTestOcasParams, requester, startForUrl, restartTest, urlRequestStop)
                        }

                        function test(attempt, error) {
                            function startTest() {
                                eventData = {
                                    attempt: testAttempt
                                }, event(events.events.ATTEMPT_START, eventData), startTime = timer();
                                var i;
                                if (currentTestType !== TEST_TYPE.LATENCY_TEST)
                                    for (i = 0; i < config.connections.min; i++) startNewWorker();
                                else
                                    for (i = 0; i < Math.min(5, config.connections.max); i++) startNewWorker();
                                reportMetrics(config.progressFrequencyMs)
                            }
                            var eventData;
                            return reset(), testAttempt = attempt || 1, testAttempt > config.maxAttempts ? void reportEndEvents({
                                result: "fail",
                                error: error
                            }) : (testIsRunning = !0, error && (eventData = {
                                error: error,
                                attempt: testAttempt - 1
                            }, event(events.events.ATTEMPT_FAIL, eventData), eventData.result = "fail", event(events.events.ATTEMPT_END, eventData), error.url && urlGetter.reportBadUrl(error.url)), void(testAttempt > 1 ? setTimeout(startTest, Math.min(Math.pow(2, testAttempt), 200)) : startTest()))
                        }

                        function event(eventName, data) {
                            var eventInd, genericHandlers, handler, handlers = eventHandlers[eventName];
                            if (data.testType = currentTestType, handlers && handlers.length > 0)
                                for (eventInd = 0; eventInd < handlers.length; ++eventInd) {
                                    handler = handlers[eventInd];
                                    try {
                                        handlers[eventInd](utils.simpleCopy(data))
                                    } catch (e) {}
                                }
                            if (genericHandlers = eventHandlers[events.events.ANY], genericHandlers && genericHandlers.length > 0)
                                for (eventInd = 0; eventInd < genericHandlers.length; ++eventInd) genericHandlers[eventInd]({
                                    event: eventName,
                                    data: utils.simpleCopy(data)
                                })
                        }
                        var that, currentTestType, reportTimeout, retryTimeout, requestTimeMs, activeWorkersCount, speedAggregator, stopper, timer, testType, testIsRunning = !1,
                            testAttempt = 1,
                            stats = {},
                            startTime = null,
                            downloadStartTime = null,
                            workerMeasurements = {},
                            latencyMeasurements = {},
                            requesters = {},
                            pingers = {},
                            progressMeasurements = [],
                            urlGetter = require("./url_getter")(),
                            uniqueId = utils.uniqueId,
                            snapshot = require("./snapshot"),
                            eventHandlers = {};
                        for (testType in TEST_TYPE) testType = TEST_TYPE[testType], stats[testType] = {}, stats[testType].tests = 0, stats[testType].results = [], stats[testType].bytes = [];
                        if (!requester) throw new errors.TesterArgumentError("requester factory should be provided to the tester");
                        return config = testConfig.get(config), timer = config.timer, speedAggregator = config.aggregator, stopper = config.stopper, that = {
                            download: function () {
                                currentTestType = TEST_TYPE.DOWNLOAD_TEST, stats[currentTestType].tests += 1, stats[currentTestType].bytes.push(0), urlGetter.reset(), event(events.events.START, {
                                    numberOfTests: stats[currentTestType].tests,
                                    type: currentTestType,
                                    stats: stats
                                }), test()
                            },
                            upload: function () {
                                currentTestType = TEST_TYPE.UPLOAD_TEST, stats[currentTestType].tests > 1 && urlGetter.reset(), stats[currentTestType].tests += 1, stats[currentTestType].bytes.push(0), event(events.events.START, {
                                    numberOfTests: stats[currentTestType].tests,
                                    type: currentTestType,
                                    stats: stats
                                }), test()
                            },
                            latency: function () {
                                currentTestType = TEST_TYPE.LATENCY_TEST, stats[currentTestType].tests > 1 && urlGetter.reset(), stats[currentTestType].tests += 1, stats[currentTestType].bytes.push(0), event(events.events.START, {
                                    numberOfTests: stats[currentTestType].tests,
                                    type: currentTestType,
                                    stats: stats
                                }), test()
                            },
                            stop: function () {
                                stop(), reportEndEvents({
                                    result: "stop",
                                    reason: "user"
                                })
                            },
                            on: function (eventName, callback) {
                                validateEvent(eventName, callback);
                                var handlers = eventHandlers[eventName];
                                return handlers || (handlers = eventHandlers[eventName] = []), handlers.push(callback), that
                            },
                            off: function (eventName, callback) {
                                validateEvent(eventName, callback);
                                var eventInd, event, handlers = eventHandlers[eventName],
                                    outHandlers = [];
                                if (handlers && handlers.length > 0) {
                                    for (eventInd = 0; eventInd < handlers.length; ++eventInd) event = handlers[eventInd], event !== callback && outHandlers.push(event);
                                    outHandlers.length > 0 && (eventHandlers[eventName] = outHandlers)
                                }
                                return that
                            },
                            config: function (attr) {
                                return attr ? config[attr] : config
                            },
                            setConfig: function (attrs) {
                                for (var name in attrs) testConfig.validate(name, attrs[name]) && (config[name] = attrs[name]);
                                return config
                            },
                            isRunning: function () {
                                return testIsRunning
                            }
                        }
                    });
                return factory
            };
            module.exports = tester()
        }), require.define("/app/utils.js", function (require, module) {
            var utils = {};
            utils.getXHR = function () {
                var XMLHttpFactories = ["Msxml2.XMLHTTP.6.0", "Msxml3.XMLHTTP", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.3.0"],
                    xmlhttp = !1;
                try {
                    if (-1 !== navigator.appVersion.indexOf("MSIE 10")) throw new Error("Error");
                    xmlhttp = new XDomainRequest
                } catch (e) {
                    try {
                        xmlhttp = new XMLHttpRequest
                    } catch (e) {
                        for (var i = 0; i < XMLHttpFactories.length; i++) try {
                            xmlhttp = new ActiveXObject(XMLHttpFactories[i]);
                            break
                        } catch (e) {}
                    }
                } finally {
                    return xmlhttp
                }
            }, utils.uniqueId = function () {
                var id = 0,
                    getId = function () {
                        var myId = id;
                        return id += 1, myId
                    };
                return getId
            }(), utils.dummy = function () {}, utils.isFunction = function (obj) {
                return !!(obj && obj.constructor && obj.call && obj.apply)
            }, utils.simpleCopy = function (obj) {
                var attr, copy = {};
                for (attr in obj) copy[attr] = obj[attr];
                return copy
            }, utils.createObject = function (obj) {
                function F() {}
                return F.prototype = obj, new F
            }, utils.median = function (values) {
                var l, half;
                return l = values.length, 0 === l ? void 0 : 1 === l ? values[0] : (half = Math.floor(l / 2), values.sort(), l % 2 ? values[half] : (values[half - 1] + values[half]) / 2)
            }, utils.percentile = function (values, p) {
                if (0 === values.length) return 0;
                if ("number" != typeof p) throw new TypeError("p must be a number");
                if (values.sort(function (a, b) {
                        return a - b
                    }), 0 >= p) return values[0];
                if (p >= 1) return values[values.length - 1];
                var index = values.length * p,
                    lower = Math.floor(index),
                    upper = lower + 1,
                    weight = index % 1;
                return upper >= values.length ? values[lower] : values[lower] * (1 - weight) + values[upper] * weight
            }, utils.addEventListener = function (elem, event, listener) {
                elem.addEventListener ? elem.addEventListener(event, listener, !1) : elem.attachEvent("on" + event, listener)
            }, utils.removeEventListener = function (elem, event, listener) {
                elem.addEventListener ? elem.removeEventListener(event, listener) : elem.detachEvent("on" + event, listener)
            }, utils.polyfillObjectKeys = function () {
                Object.keys || (Object.keys = function () {
                    var hasOwnProperty = Object.prototype.hasOwnProperty,
                        hasDontEnumBug = !{
                            toString: null
                        }.propertyIsEnumerable("toString"),
                        dontEnums = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"],
                        dontEnumsLength = dontEnums.length;
                    return function (obj) {
                        if ("object" != typeof obj && ("function" != typeof obj || null === obj)) throw new TypeError("Object.keys called on non-object");
                        var prop, i, result = [];
                        for (prop in obj) hasOwnProperty.call(obj, prop) && result.push(prop);
                        if (hasDontEnumBug)
                            for (i = 0; dontEnumsLength > i; i++) hasOwnProperty.call(obj, dontEnums[i]) && result.push(dontEnums[i]);
                        return result
                    }
                }())
            }, utils.onDomReady = function (callback) {
                function onReadyIe() {
                    "complete" === document.readyState && (document.detachEvent("onreadystatechange", onReadyIe), callback())
                }
                document.addEventListener ? document.addEventListener("DOMContentLoaded", callback, !1) : document.attachEvent("onreadystatechange", onReadyIe)
            }, utils.genBlob = function (size) {
                var blobStr;
                for (blobStr = ""; 2 * blobStr.length <= size;) blobStr += blobStr + Math.random().toString();
                blobStr.length > size ? blobStr = blobStr.substring(0, size) : blobStr += blobStr.substring(0, size - blobStr.length);
                try {
                    blob = new Blob([blobStr], {
                        type: "application/octet-stream"
                    })
                } catch (e) {
                    try {
                        var bb = new(window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder);
                        bb.append(blobStr), blob = bb.getBlob("application/octet-stream")
                    } catch (e) {
                        blob = blobStr
                    }
                }
                return blob
            }, module.exports = utils
        }), require.define("/app/error.js", function (require, module) {
            function TesterArgumentError() {
                var temp = Error.apply(this, arguments);
                temp.name = this.name = "TesterArgumentError", this.stack = temp.stack, this.message = temp.message
            }

            function TesterEventError() {
                var temp = Error.apply(this, arguments);
                temp.name = this.name = "TesterEventError", this.stack = temp.stack, this.message = temp.message
            }

            function RequesterArgumentError() {
                var temp = Error.apply(this, arguments);
                temp.name = this.name = "RequesterArgumentError", this.stack = temp.stack, this.message = temp.message
            }

            function GetOcaUrlError() {
                var temp = Error.apply(this, arguments);
                temp.name = this.name = "GetOcaUrlError", this.stack = temp.stack, this.message = temp.message
            }

            function NoOcaUrlsError() {
                var temp = Error.apply(this, arguments);
                temp.name = this.name = "NoOcaUrlsError", this.stack = temp.stack, this.message = temp.message
            }

            function DownloadOcaDataError() {
                var temp = Error.apply(this, arguments);
                temp.name = this.name = "DownloadOcaDataError", this.stack = temp.stack, this.message = temp.message
            }
            var errors = {};
            TesterArgumentError.prototype = Error.prototype, errors.TesterArgumentError = TesterArgumentError, TesterEventError.prototype = Error.prototype, errors.TesterEventError = TesterEventError, RequesterArgumentError.prototype = Error.prototype, errors.RequesterArgumentError = RequesterArgumentError, GetOcaUrlError.prototype = Error.prototype, errors.GetOcaUrlError = GetOcaUrlError, NoOcaUrlsError.prototype = Error.prototype, errors.NoOcaUrlsError = NoOcaUrlsError, DownloadOcaDataError.prototype = Error.prototype, errors.DownloadOcaDataError = DownloadOcaDataError, module.exports = errors
        }), require.define("/app/event.js", function (require, module) {
            var events = {
                    START: "start",
                    END: "end",
                    SUCCESS: "success",
                    FAIL: "fail",
                    STOP: "stop",
                    ATTEMPT_START: "attemptStart",
                    ATTEMPT_END: "attemptEnd",
                    ATTEMPT_SUCCESS: "attemptSuccess",
                    ATTEMPT_FAIL: "attemptFail",
                    PROGRESS: "progress",
                    SNAPSHOT: "snapshot",
                    CONNECTION_START: "connectionStart",
                    CONNECTION_FAIL: "connectionFail",
                    CONNECTION_PROGRESS: "connectionProgress",
                    CONNECTION_SUCCESS: "connectionSuccess",
                    CONNECTION_END: "connectionEnd",
                    LATENCY_START: "latencyStart",
                    LATENCY_FAIL: "latencyFail",
                    LATENCY_SUCCESS: "latencySuccess",
                    LATENCY_END: "latencyEnd",
                    UPLOAD_START: "uploadStart",
                    UPLOAD_FAIL: "uploadFail",
                    UPLOAD_SUCCESS: "uploadSuccess",
                    UPLOAD_END: "uploadEnd",
                    URL_REQUEST_START: "urlRequestStart",
                    URL_REQUEST_END: "urlRequestEnd",
                    AFTER_COMPLETE_ATTEMPT_START: "afterCompleteAttemptStart",
                    AFTER_COMPLETE_ATTEMPT_END: "afterCompleteAttemptEnd",
                    ANY: "event"
                },
                schema = {
                    start: {},
                    end: {},
                    success: {},
                    fail: {},
                    stop: {},
                    attemptStart: {},
                    attemptEnd: {},
                    attemptSuccess: {},
                    attemptFail: {},
                    progress: {},
                    snapshot: {},
                    connectionStart: {},
                    connectionFail: {},
                    connectionProgress: {},
                    connectionSuccess: {},
                    connectionEnd: {},
                    latencyStart: {},
                    latencyFail: {},
                    latencySuccess: {},
                    latencyEnd: {},
                    uploadStart: {},
                    uploadFail: {},
                    uploadSuccess: {},
                    uploadEnd: {},
                    urlRequestStart: {},
                    urlRequestEnd: {},
                    afterCompleteAttemptStart: {},
                    afterCompleteAttemptEnd: {},
                    event: {}
                };
            module.exports = {
                events: events,
                schema: schema
            }
        }), require.define("/app/config.js", function (require, module) {
            module.exports = function () {
                function positiveNumberValidator(name) {
                    return function (value) {
                        if (0 >= value) throw new errors.TesterArgumentError(name + ": expected value should be above 0, given value: " + value)
                    }
                }

                function update(config, overrides) {
                    var name, value;
                    if (overrides)
                        for (name in overrides) value = overrides[name], validate(name, value), config[name] = value;
                    return config
                }

                function validate(name, value) {
                    var validator;
                    if (void 0 === defaultConfig[name]) throw new errors.TesterArgumentError("unknown tester config attribute: " + name);
                    return validator = validators[name], validator && validator(value), !0
                }
                var errors = require("./error"),
                    timer = require("./timer"),
                    utils = require("./utils"),
                    validators = {
                        maxAttempts: positiveNumberValidator("maxAttempts"),
                        maxConnections: positiveNumberValidator("maxConnections"),
                        progressFrequencyMs: positiveNumberValidator("progressFrequencyMs"),
                        firstRequestBytes: positiveNumberValidator("firstRequestBytes"),
                        maxBytesInFlight: positiveNumberValidator("maxBytesInFlight"),
                        startRangeRequestTimeMs: positiveNumberValidator("startRangeRequestTimeMs"),
                        maxRangeRequestTimeMs: positiveNumberValidator("maxRangeRequestTimeMs"),
                        rangeRequestIncreaseMs: positiveNumberValidator("rangeRequestIncreaseMs"),
                        latencyMeasurementsWindowSize: positiveNumberValidator("latencyMeasurementsWindowSize"),
                        minLatencyMeasurements: positiveNumberValidator("minLatencyMeasurements"),
                        latencyMeasurementsFrequencyMs: positiveNumberValidator("latencyMeasurementsFrequencyMs"),
                        protocol: function (protocol) {
                            if ("http" !== protocol && "https" !== protocol) throw new errors.TesterArgumentError("protocol: only http and https are supported, given value: " + protocol)
                        },
                        version: function () {
                            throw new errors.TesterArgumentError("can not override tester version")
                        },
                        duration: function (duration) {
                            if (void 0 === duration.min) throw new errors.TesterArgumentError("duration: when provided, duration.min is mandatory");
                            if (void 0 === duration.max) throw new errors.TesterArgumentError("duration: when provided, duration.max is mandatory");
                            if (duration.min > duration.max) throw new errors.TesterArgumentError("duration: max duration should be higher or equal to min duration, given value: min=" + duration.min + ", max=" + duration.max);
                            if (duration.min < 0) throw new errors.TesterArgumentError("duration.min can not be negative");
                            if (duration.max < 0) throw new errors.TesterArgumentError("duration.max can not be negative")
                        },
                        connections: function (connections) {
                            if (void 0 === connections.min) throw new errors.TesterArgumentError("connections: when provided, connections.min is mandatory");
                            if (void 0 === connections.max) throw new errors.TesterArgumentError("connections: when provided, connections.max is mandatory");
                            if (connections.min > connections.max) throw new errors.TesterArgumentError("connections: max connections should be higher or equal to min connections, given value: min=" + connections.min + ", max=" + connections.max);
                            if (connections.min <= 0) throw new errors.TesterArgumentError("connections.min should be positive");
                            if (connections.max <= 0) throw new errors.TesterArgumentError("connections.max should be positive")
                        }
                    },
                    defaultDuration = {
                        min: 5,
                        max: 30
                    },
                    defaultConfig = {
                        version: "0.3.11",
                        maxAttempts: 5,
                        connections: {
                            min: 1,
                            max: 3
                        },
                        duration: defaultDuration,
                        progressFrequencyMs: 200,
                        protocol: "https",
                        firstRequestBytes: 2048,
                        maxBytesInFlight: 78643200,
                        collectAfterComplete: !1,
                        getTestOcasParams: {},
                        startRangeRequestTimeMs: 300,
                        maxRangeRequestTimeMs: 1e3,
                        rangeRequestIncreaseMs: 200,
                        timer: timer.time,
                        measureLatency: !1,
                        latencyMeasurementsWindowSize: 5,
                        minLatencyMeasurements: 3,
                        latencyMeasurementsFrequencyMs: 1e3,
                        aggregator: require("./aggregator/movingAverage")(10),
                        stopper: require("./stopper/stableMeasurementsStopper")({
                            minDuration: defaultDuration.min,
                            maxDuration: defaultDuration.max,
                            stabilityDelta: 3,
                            minStableMeasurements: 10
                        })
                    };
                return {
                    get: function (overrides) {
                        var config = utils.simpleCopy(defaultConfig);
                        return overrides && update(config, overrides), config
                    },
                    validate: function (name, value) {
                        return validate(name, value)
                    }
                }
            }()
        }), require.define("/app/aggregator/movingAverage.js", function (require, module) {
            module.exports = function (windowSize) {
                function movingAvg(snapshots) {
                    var snapshotInd, bytes = 0,
                        times = 0,
                        start = snapshots.length - 1,
                        end = Math.max(0, snapshots.length - windowSize);
                    for (snapshotInd = start; snapshotInd >= end; --snapshotInd) snapshot = snapshots[snapshotInd], bytes += snapshot.bytes, times += snapshot.time;
                    return times > 0 ? 1e3 * bytes * 8 / times : 0
                }
                return movingAvg
            }
        }), require.define("/app/stopper/stableMeasurementsStopper.js", function (require, module) {
            module.exports = function (config) {
                function lastWindowMaxInd(measurements, windowSize) {
                    var measurement, curMaxSpeed = 0,
                        curMaxInd = 0,
                        measurementInd = 0,
                        numMeasurements = measurements.length,
                        firstMeasurementInd = Math.max(0, numMeasurements - windowSize);
                    for (measurementInd = numMeasurements - 1; measurementInd >= firstMeasurementInd; --measurementInd) measurement = measurements[measurementInd], measurement.speed >= curMaxSpeed && (curMaxSpeed = measurement.speed, curMaxInd = measurementInd);
                    return curMaxInd
                }

                function maxDelta(value, measurements) {
                    var measurementInd, delta, maxDelta = 0;
                    for (measurementInd = 0; measurementInd < measurements.length; ++measurementInd) delta = 100 * Math.abs(measurements[measurementInd].speed - value) / value, delta > maxDelta && (maxDelta = delta);
                    return delta
                }

                function isCompleted(metrics) {
                    var testTime = void 0 !== metrics.testTime ? metrics.testTime : timer() - startTime,
                        measurements = metrics.progressMeasurements,
                        afterCompleteDuration = metrics.afterCompleteDuration,
                        numMeasurements = measurements.length;
                    if (void 0 === afterCompleteDuration) {
                        if (testTime >= maxDuration) return !0;
                        if (minStableMeasurements > numMeasurements) return !1;
                        var maxInd = lastWindowMaxInd(measurements, minStableMeasurements);
                        if (minStableMeasurements > numMeasurements - maxInd) return !1;
                        var delta = maxDelta(measurements[maxInd].speed, measurements.slice(numMeasurements - minStableMeasurements, numMeasurements));
                        return delta > stabilityDelta ? !1 : testTime >= minDuration
                    }
                    return testTime >= afterCompleteDuration
                }
                var minDuration, maxDuration, stabilityDelta, minStableMeasurements, timer, startTime;
                return minDuration = config.minDuration || 5, maxDuration = config.maxDuration || 60, stabilityDelta = config.stabilityDelta || 5, minStableMeasurements = config.minStableMeasurements || 5, timer = config.timer || require("../timer").time, startTime = timer(), isCompleted
            }
        }), require.define("/node_modules/circular-buffer/package.json", function (require, module) {
            module.exports = {
                main: "index.js"
            }
        }), require.define("/node_modules/circular-buffer/index.js", function (require, module) {
            function CircularBuffer(capacity) {
                if (!(this instanceof CircularBuffer)) return new CircularBuffer(capacity);
                if ("object" == typeof capacity && Array.isArray(capacity._buffer) && "number" == typeof capacity._capacity && "number" == typeof capacity._first && "number" == typeof capacity._size)
                    for (var prop in capacity) capacity.hasOwnProperty(prop) && (this[prop] = capacity[prop]);
                else {
                    if ("number" != typeof capacity || capacity % 1 != 0 || 1 > capacity) throw new TypeError("Invalid capacity");
                    this._buffer = new Array(capacity), this._capacity = capacity, this._first = 0, this._size = 0
                }
            }
            CircularBuffer.prototype = {
                size: function () {
                    return this._size
                },
                capacity: function () {
                    return this._capacity
                },
                enq: function (value) {
                    this._first > 0 ? this._first-- : this._first = this._capacity - 1, this._buffer[this._first] = value, this._size < this._capacity && this._size++
                },
                push: function (value) {
                    this._size == this._capacity ? (this._buffer[this._first] = value, this._first = (this._first + 1) % this._capacity) : (this._buffer[(this._first + this._size) % this._capacity] = value, this._size++)
                },
                deq: function () {
                    if (0 == this._size) throw new RangeError("dequeue on empty buffer");
                    var value = this._buffer[(this._first + this._size - 1) % this._capacity];
                    return this._size--, value
                },
                pop: function () {
                    return this.deq()
                },
                shift: function () {
                    if (0 == this._size) throw new RangeError("shift on empty buffer");
                    var value = this._buffer[this._first];
                    return this._first == this._capacity - 1 ? this._first = 0 : this._first++, this._size--, value
                },
                get: function (start, end) {
                    if (0 == this._size && 0 == start && (void 0 == end || 0 == end)) return [];
                    if ("number" != typeof start || start % 1 != 0 || 0 > start) throw new TypeError("Invalid start");
                    if (start >= this._size) throw new RangeError("Index past end of buffer: " + start);
                    if (void 0 == end) return this._buffer[(this._first + start) % this._capacity];
                    if ("number" != typeof end || end % 1 != 0 || 0 > end) throw new TypeError("Invalid end");
                    if (end >= this._size) throw new RangeError("Index past end of buffer: " + end);
                    return this._first + start >= this._capacity && (start -= this._capacity, end -= this._capacity), this._first + end < this._capacity ? this._buffer.slice(this._first + start, this._first + end + 1) : this._buffer.slice(this._first + start, this._capacity).concat(this._buffer.slice(0, this._first + end + 1 - this._capacity))
                },
                toarray: function () {
                    return 0 == this._size ? [] : this.get(0, this._size - 1)
                }
            }, module.exports = CircularBuffer
        }), require.define("/app/url_getter.js", function (require, module) {
            var urlGetter = function () {
                function badUrlReporter() {
                    function parseUrl(url) {
                        var endpoint, urlParts = url.split("?"),
                            urlData = {};
                        return urlData.url = url, urlData.normalizedUrl = url, endpoint = urlParts[0], 2 === urlParts.length && (speedtestInd = endpoint.lastIndexOf("/speedtest"), speedtestInd ? (endpoint = endpoint.substring(0, speedtestInd + 10), urlData.normalizedUrl = endpoint + "?" + urlParts[1]) : urlData.normalizedUrl = url), endpoint = endpoint.replace(/.*?:\/\//g, ""), urlData.oca = endpoint.split("/")[0], urlData.site = urlData.oca.split(".")[2], urlData
                    }

                    function reset() {
                        badUrls = {}, ocaFailures = {}, siteFailures = {}, clientInfo = {}
                    }
                    var badUrls, ocaFailures, siteFailures;
                    return reset(), {
                        reset: reset,
                        isBadUrl: function (url) {
                            var urlData = parseUrl(url),
                                ocaFails = void 0 === ocaFailures[urlData.oca] ? 0 : ocaFailures[urlData.oca],
                                siteFails = void 0 === siteFailures[urlData.site] ? 0 : siteFailures[urlData.site];
                            return url = urlData.normalizedUrl, void 0 !== badUrls[url] || ocaFails >= 2 || siteFails >= 3
                        },
                        reportBadUrl: function (url) {
                            var urlData = parseUrl(url);
                            url = urlData.normalizedUrl, badUrls[url] = !0, urlData.oca && (ocaFailures[urlData.oca] = void 0 === ocaFailures[urlData.oca] ? 1 : ocaFailures[urlData.oca] + 1), 1 === ocaFailures[urlData.oca] && urlData.site && (siteFailures[urlData.site] = void 0 === siteFailures[urlData.site] ? 1 : siteFailures[urlData.site] + 1)
                        }
                    }
                }

                function parseSpeedTestUrls(responseText) {
                    var response, targets, ind, url, allUrls;
                    for (allUrls = [], response = JSON.parse(responseText), targets = response.targets || [], clientInfo = response.client || {}, clientInfo.servers = [], ind = 0; ind < targets.length; ++ind) url = targets[ind].url, url = url.replace(/speedtest/, "speedtest/range/"), urlReporter.isBadUrl(url) || (testUrls.push(url), clientInfo.servers.push(targets[ind])), allUrls.push(url);
                    return 0 === testUrls.length && (testUrls = allUrls), testUrls
                }

                function formatUrl(params) {
                    var param, endpoint = params.endpoint || DEFAULT_PARAMS.endpoint,
                        https = void 0 !== params.https ? params.https : DEFAULT_PARAMS.https,
                        token = params.token || DEFAULT_PARAMS.token,
                        urlCount = params.urlCount || DEFAULT_PARAMS.urlCount,
                        url = "https://" + endpoint + "?https=" + https + "&token=" + token + "&urlCount=" + urlCount;
                    for (param in params.extraParams) params.extraParams.hasOwnProperty(param) && (url += "&" + param + "=" + params.extraParams[param]);
                    return url
                }

                function reset() {
                    testUrls = [], curUrlInd = 0, req = void 0
                }
                var DEFAULT_PARAMS, curUrlInd, testUrls, that, errors, req, urlReporter, clientInfo;
                return errors = require("./error"), dummy = require("./utils").dummy, DEFAULT_PARAMS = {
                    https: !0,
                    token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
                    urlCount: 3,
                    endpoint: "api-global.netflix.com/oca/speedtest",
                    extraParams: {}
                }, that = {}, urlReporter = badUrlReporter(), reset(), that.get = function (urlParams, requester, onComplete, onFail, onStop, refresh) {
                    function returnUrl(urls) {
                        urls.length > 0 ? onComplete(urls[curUrlInd]) : onFail(new errors.NoOcaUrlsError("No urls returned from the endpoint " + url))
                    }
                    return 0 === testUrls.length || refresh ? void that.refresh(urlParams, requester, returnUrl, onFail, onStop) : void returnUrl(testUrls)
                }, that.getNext = function (urlParams, requester, onComplete, onFail, onStop, refresh) {
                    return testUrls.length < 3 || refresh ? void that.get(urlParams, requester, onComplete, onFail, onStop, !0) : (curUrlInd = (curUrlInd + 1) % testUrls.length, void(testUrls.length > 0 ? onComplete(testUrls[curUrlInd]) : onFail(new errors.NoOcaUrlsError("No urls returned from the endpoint " + urlParams))))
                }, that.reportBadUrl = function (url) {
                    var urlInd, newTestUrls = [];
                    for (urlReporter.reportBadUrl(url), urlInd = 0; urlInd < testUrls.length; ++urlInd) urlReporter.isBadUrl(testUrls[urlInd]) || newTestUrls.push(testUrls[urlInd]);
                    return testUrls = newTestUrls
                }, that.refresh = function (urlParams, requester, onSuccess, onFail, onStop) {
                    function urlSuccess(data) {
                        req = void 0, data.success ? (reset(), testUrls = parseSpeedTestUrls(data.response), onSuccess(testUrls)) : "stopped" !== data.reason ? (error = new errors.GetOcaUrlError("Could not send request to " + url), error.response = data.response, onFail(error)) : onStop(data)
                    }
                    req = requester(), url = formatUrl(urlParams), req.start(url, dummy, urlSuccess, !0)
                }, that.stop = function () {
                    req && req.stop()
                }, that.reset = function () {
                    reset(), urlReporter.reset()
                }, that.clientInfo = function () {
                    return clientInfo
                }, that
            };
            module.exports = urlGetter
        }), require.define("/app/snapshot.js", function (require, module) {
            module.exports = function () {
                function reset() {
                    snapshots = [], lastProcessedWorkerMeasurement = {}, overflowMeasurements = {}
                }

                function getLatestSnapshotMeasurements(workerMeasurements) {
                    var workerId, snapshotMeasurements, curWorkerMeasurements, workerMeasurementsCount, lastMeasurement, lastMeasurementInd, snapshotEnd, newLastProcessedWorkerMeasurement, curWorkerOverflowMeasurements;
                    snapshotMeasurements = [], newLastProcessedWorkerMeasurement = {};
                    for (workerId in workerMeasurements)
                        if (workerMeasurements.hasOwnProperty(workerId)) {
                            if (curWorkerMeasurements = workerMeasurements[workerId], workerMeasurementsCount = curWorkerMeasurements.length, lastMeasurementInd = lastProcessedWorkerMeasurement[workerId] || 0, curWorkerOverflowMeasurements = overflowMeasurements[workerId] || [], !(workerMeasurementsCount > lastMeasurementInd || curWorkerOverflowMeasurements.length > 0)) return;
                            overflowMeasurements[workerId] = [], snapshotMeasurements.push({
                                workerId: workerId,
                                measurements: [].concat(curWorkerOverflowMeasurements, curWorkerMeasurements.slice(lastMeasurementInd, workerMeasurementsCount))
                            }), lastMeasurement = curWorkerMeasurements[workerMeasurementsCount - 1], (!snapshotEnd || lastMeasurement.end < snapshotEnd) && (snapshotEnd = lastMeasurement.end), newLastProcessedWorkerMeasurement[workerId] = workerMeasurementsCount
                        } return lastProcessedWorkerMeasurement = newLastProcessedWorkerMeasurement, {
                        measurements: snapshotMeasurements,
                        end: snapshotEnd
                    }
                }

                function trimSnapshotMeasurements(snapshotMeasurements, snapshotEnd) {
                    var curWorkerMeasurements, workerId, lastMeasurement, measurementId, overflowMeasurement, snapshotInd, snapshot;
                    for (snapshotInd = 0; snapshotInd < snapshotMeasurements.length; ++snapshotInd) {
                        for (snapshot = snapshotMeasurements[snapshotInd], curWorkerMeasurements = snapshot.measurements, workerId = snapshot.workerId, measurementId = curWorkerMeasurements.length - 1; measurementId >= 0 && (lastMeasurement = curWorkerMeasurements[measurementId], lastMeasurement.start >= snapshotEnd); --measurementId) overflowMeasurements[workerId] || (overflowMeasurements[workerId] = []), overflowMeasurements[workerId].push(lastMeasurement);
                        snapshot.measurements = curWorkerMeasurements.slice(0, measurementId + 1), measurementId >= 0 && lastMeasurement && lastMeasurement.end > snapshotEnd && (overflowMeasurement = {
                            start: snapshotEnd,
                            end: lastMeasurement.end
                        }, overflowMeasurement.bytes = lastMeasurement.bytes * (lastMeasurement.end - snapshotEnd) / (lastMeasurement.end - lastMeasurement.start), lastMeasurement.bytes -= overflowMeasurement.bytes, lastMeasurement.end = snapshotEnd, overflowMeasurements[workerId] || (overflowMeasurements[workerId] = []), overflowMeasurements[workerId].push(overflowMeasurement))
                    }
                    return snapshotMeasurements
                }

                function makeSnapshot(snapshotMeasurements) {
                    function minStart(curWorkerMeasurements) {
                        var snapshotInd, min = {
                            workerId: null,
                            measurement: {},
                            snapshotInd: null
                        };
                        for (snapshotInd = 0; snapshotInd < snapshotMeasurements.length; ++snapshotInd) {
                            var workerId = snapshotMeasurements[snapshotInd].workerId,
                                measurements = snapshotMeasurements[snapshotInd].measurements,
                                measurementInd = curWorkerMeasurements[workerId] || 0,
                                measurement = measurements[measurementInd];
                            measurement && (void 0 === min.measurement.start || measurement.start < min.measurement.start) && (min.workerId = workerId, min.measurement = measurement, min.snaphotInd = snapshotInd)
                        }
                        return min
                    }
                    var minTime, maxTime, snapshot, curRange, rangeFinished, curLastTime;
                    for (snapshot = {
                            bytes: 0,
                            time: 0
                        }, curRange = {}, rangeFinished = 0; rangeFinished < snapshotMeasurements.length;) {
                        var curMin = minStart(curRange);
                        null !== curMin.workerId ? (curRange[curMin.workerId] = (curRange[curMin.workerId] || 0) + 1, curRange[curMin.workerId] >= snapshotMeasurements[curMin.snaphotInd].measurements.length && (rangeFinished += 1), void 0 === minTime && (minTime = curMin.measurement.start, curLastTime = minTime), curLastTime = Math.max(curLastTime, curMin.measurement.start), curMin.measurement.end > curLastTime && (snapshot.time += curMin.measurement.end - curLastTime, curLastTime = curMin.measurement.end), snapshot.bytes += curMin.measurement.bytes) : rangeFinished += 1
                    }
                    return maxTime = curLastTime, void 0 !== maxTime && void 0 !== minTime ? (snapshot.start = minTime, snapshot.end = maxTime, snapshot) : void 0
                }
                var snapshots, lastProcessedWorkerMeasurement, overflowMeasurements;
                return reset(), {
                    reset: function () {
                        reset()
                    },
                    compute: function (workerMeasurements) {
                        var workerSnapshotData = getLatestSnapshotMeasurements(workerMeasurements);
                        if (workerSnapshotData) {
                            var snapshotMeasurements = trimSnapshotMeasurements(workerSnapshotData.measurements, workerSnapshotData.end),
                                snapshot = makeSnapshot(snapshotMeasurements);
                            return snapshot && snapshots.push(snapshot), snapshot
                        }
                    },
                    length: function () {
                        return snapshots.length
                    },
                    all: function () {
                        return snapshots
                    }
                }
            }()
        }), require.define("/app/requester/xhr.js", function (require, module) {
            var requester = function () {
                function extractTimingInfo(data, url) {
                    var entries, timing, end;
                    window && window.performance && window.performance.getEntriesByName && (entries = window.performance.getEntriesByName(url), 0 != entries.length && (timing = entries[entries.length - 1], end = timing.responseStart || timing.responseEnd, end && (data.timing = timing, data.start = timing.requestStart || timing.connectEnd || timing.startTime || timing.fetchTime || data.start, data.end = end)))
                }

                function validate(url, onProgressCallback, onCompleteCallback) {
                    if (!url) throw new errors.RequesterArgumentError("url arguments is mandatory to perform speed test");
                    if (!onProgressCallback) throw new errors.RequesterArgumentError("onProgressCallback is mandatory");
                    if (!onCompleteCallback) throw new errors.RequesterArgumentError("onCompleteCallback is mandatory")
                }

                function startTest(url, withResponse) {
                    function ontimeout() {
                        testIsRunning = !1, request && request.abort(), onComplete({
                            success: !1,
                            response: {
                                type: "Timeout",
                                message: "Request timed out. Timeout: " + requestTimeoutMs + "ms"
                            }
                        })
                    }

                    function onerror() {
                        var headers, errorMessage;
                        clearTimeout(xmlHttpTimeout), errorMessage = this.response, !errorMessage && withResponse && (errorMessage = this.responseText), this.getAllResponseHeaders && (headers = this.getAllResponseHeaders()), onComplete({
                            success: !1,
                            response: {
                                type: "RequestError",
                                status: this.status,
                                statusText: this.statusText,
                                message: errorMessage,
                                headers: headers,
                                url: url
                            }
                        })
                    }

                    function onload() {
                        var now, data, responseSize;
                        testIsRunning && (now = timer(), clearTimeout(xmlHttpTimeout), data = {
                            success: !0,
                            start: lastCompleteTime,
                            end: now
                        }, withResponse && (data.response = this.responseText), responseSize = this.response && this.response.size, extractTimingInfo(data, url), onProgress({
                            start: lastProgressTime,
                            end: data.end,
                            success: !0,
                            bytes: void 0 !== responseSize ? responseSize - lastBytesLoaded : responseSize
                        }), onComplete(data))
                    }

                    function onprogress(e) {
                        clearTimeout(xmlHttpTimeout);
                        var now, newBytesLoaded;
                        200 !== this.status && 304 !== this.status || !e.lengthComputable || (now = timer(), newBytesLoaded = e.loaded - lastBytesLoaded, lastBytesLoaded = e.loaded, onProgress({
                            bytes: newBytesLoaded,
                            success: !0,
                            start: lastProgressTime,
                            end: now
                        }), lastProgressTime = now)
                    }
                    var lastBytesLoaded, lastProgressTime, lastCompleteTime, xmlHttpTimeout;
                    lastBytesLoaded = 0, request = xhr(), request.onprogress = onprogress, xmlHttpTimeout = setTimeout(ontimeout, requestTimeoutMs), "onreadystatechange" in request ? request.onreadystatechange = function () {
                        testIsRunning && 4 === this.readyState && (200 === this.status || 304 === this.status ? onload.apply(this) : onerror.apply(this))
                    } : (request.onerror = onerror, request.onload = onload, request.ontimeout = function () {}), request.open("GET", url, !0), withResponse || (request.overrideMimeType && request.overrideMimeType("text/plain; charset=x-user-defined"), request.responseType = "blob"), lastProgressTime = lastCompleteTime = timer(), request.timeout = 6e4, setTimeout(function () {
                        request && request.send()
                    }, 0)
                }

                function uploadTest(url, size) {
                    function ontimeout() {
                        testIsRunning = !1, request && request.abort(), onComplete({
                            success: !1,
                            response: {
                                type: "Timeout",
                                message: "Request timed out. Timeout: " + requestTimeoutMs + "ms"
                            }
                        })
                    }

                    function onerror() {
                        var headers, errorMessage;
                        clearTimeout(xmlHttpTimeout), errorMessage = this.response, errorMessage || (errorMessage = this.responseText), this.getAllResponseHeaders && (headers = this.getAllResponseHeaders()), onComplete({
                            success: !1,
                            response: {
                                type: "RequestError",
                                status: this.status,
                                statusText: this.statusText,
                                message: errorMessage,
                                headers: headers,
                                url: url
                            }
                        })
                    }

                    function onload() {
                        var now, data;
                        testIsRunning && (now = timer(), clearTimeout(xmlHttpTimeout), data = {
                            success: !0,
                            start: lastCompleteTime,
                            end: now
                        }, extractTimingInfo(data, url), onProgress({
                            start: lastProgressTime,
                            bytes: size - lastBytesLoaded,
                            end: data.end,
                            success: !0
                        }), onComplete(data))
                    }

                    function onprogress(e) {
                        clearTimeout(xmlHttpTimeout);
                        var now, newBytesLoaded;
                        now = timer(), newBytesLoaded = e.loaded - lastBytesLoaded, lastBytesLoaded = e.loaded, onProgress({
                            bytes: newBytesLoaded,
                            success: !0,
                            start: lastProgressTime,
                            end: now
                        }), lastProgressTime = now
                    }
                    var lastBytesLoaded, lastProgressTime, lastCompleteTime, xmlHttpTimeout;
                    lastBytesLoaded = 0, request = xhr(), request.upload && (request.upload.onprogress = onprogress), xmlHttpTimeout = setTimeout(ontimeout, requestTimeoutMs), "onreadystatechange" in request ? request.onreadystatechange = function () {
                        testIsRunning && 4 === this.readyState && (this.status >= 200 && this.status < 300 || 304 === this.status ? onload.apply(this) : onerror.apply(this))
                    } : request.upload && (request.upload.onerror = onerror, request.upload.onload = onload, request.upload.ontimeout = function () {}), request.open("POST", url, !0);
                    try {
                        size > 0 && request.setRequestHeader("Content-type", "application/octet-stream")
                    } catch (err) {}
                    var blob = null;
                    size > 0 && (blob = utils.genBlob(size)), lastProgressTime = lastCompleteTime = timer(), request.timeout = 6e4, setTimeout(function () {
                        request && request.send(blob)
                    }, 0)
                }
                var testIsRunning, request, errors, xhr, timer, utils, requestTimeoutMs, dummy, onComplete, onProgress, supportsProgress;
                return requestTimeoutMs = 1e4, errors = require("../error"), utils = require("../utils"), xhr = utils.getXHR, timer = require("../timer").time, dummy = require("../utils").dummy, testIsRunning = !1, {
                    start: function (url, onProgressCallback, onCompleteCallback, withResponse) {
                        validate(url, onProgressCallback, onCompleteCallback), onComplete = onCompleteCallback, onProgress = onProgressCallback, testIsRunning = !0, startTest(url, withResponse)
                    },
                    upload: function (url, size, onProgressCallback, onCompleteCallback) {
                        validate(url, onProgressCallback, onCompleteCallback), onComplete = onCompleteCallback, onProgress = onProgressCallback, testIsRunning = !0, uploadTest(url, size)
                    },
                    supportsProgress: function () {
                        return void 0 !== supportsProgress ? supportsProgress : void(supportsProgress = window.XDomainRequest && -1 === navigator.appVersion.indexOf("MSIE 10") ? !1 : "onprogress" in xhr())
                    },
                    stop: function () {
                        testIsRunning = !1, request && (request.onreadystatechange = dummy, request.onprogress = dummy, request.abort(), request = void 0, onComplete({
                            success: !1,
                            reason: "stopped"
                        }), onComplete = dummy, onProgress = dummy)
                    }
                }
            };
            module.exports = requester
        }), require.define("/app/logger.js", function (require, module) {
            function logger(tester, config) {
                function sendLogs(data) {
                    function onload() {}

                    function onerror() {}
                    var request = require("./utils").getXHR();
                    request.onload ? (request.onload = onload, request.onerror = onerror) : request.onreadystatechange = function () {
                        4 === this.readyState && (this.status >= 200 && this.status < 400 ? onload() : onerror())
                    }, request.open("POST", logUrl, !0), request.timeout = 5e3, request.setRequestHeader && request.setRequestHeader("Content-type", "application/json"), request.send(data)
                }

                function getPageLoadPerformance() {
                    return window && window.performance && window.performance.timing ? window.performance.timing : {}
                }

                function endSessionType(data) {
                    switch (data.result) {
                        case "success":
                            return "SessionEnded";
                        case "fail":
                            return "ActionFailed";
                        case "stop":
                            return "SessionCancelled"
                    }
                }

                function endConnectionSession(oca, data) {
                    var connectionSessionId = connectionSessionIds[oca];
                    data.type = endSessionType(data), data.measurements = connectionEvents[oca], nfLogger.endSession(connectionSessionId, data), delete connectionSessionIds[oca], delete connectionEvents[oca]
                }

                function endMeasureSession(sessionId, data) {
                    data.type = endSessionType(data), data.snapshots = snapshotEvents, data.progress = progressEvents, data.latencies = latencyEvents, snapshotEvents = [], progressEvents = [], latencyEvents = {}, nfLogger.endSession(sessionId, data)
                }
                var DEFAULT_URL = "https://ichnaea.test.netflix.com/cl2",
                    DEFAULT_SOURCE = "netspeed",
                    SPEED_TEST_SESSION = "SpeedTest",
                    MEASURE_ATTEMPT_SESSION = "Measure",
                    CONNECTION_SESSION = "Connection",
                    AFTER_COMPLETE_SESSION = "AfterCompleteMeasure",
                    URL_REQUEST_SESSION = "GetUrl",
                    CLIENT_CONTEXT = "Client";
                PAGE_LOAD = "pageLoad";
                var logUrl, logSource, that, nfLogger, utils, testSessionId, testAttemptSessionId, afterCompleteSessionId, loggingEnabled = !1,
                    connectionSessionIds = {},
                    getUrlSessionIds = [],
                    snapshotEvents = [],
                    progressEvents = [],
                    latencyEvents = {},
                    connectionEvents = {},
                    events = require("./event").events;
                return config = config || {}, logUrl = config.url || DEFAULT_URL, logSource = config.source || DEFAULT_SOURCE, utils = require("./utils"), nfLogger = require("nf-cl-logger")({
                    requestSender: sendLogs,
                    batchInterval: 6e5,
                    batchSize: 1e5,
                    source: logSource
                }), nfLogger.addContext(CLIENT_CONTEXT, {
                    deviceType: navigator.deviceData ? "Mobile" : "Browser",
                    appVersion: navigator.appVersion,
                    userAgent: navigator.userAgent,
                    tester: tester.config(),
                    referrer: document.referrer,
                    deviceInfo: navigator.deviceData,
                    href: window && window.location && window.location.href || "NA"
                }), that = {
                    startLogging: function () {
                        loggingEnabled || (loggingEnabled = !0, tester.on(events.START, function (data) {
                            testSessionId = nfLogger.startSession(SPEED_TEST_SESSION, data)
                        }), tester.on(events.END, function (data) {
                            data[PAGE_LOAD] = getPageLoadPerformance(), data.type = endSessionType(data), nfLogger.endSession(testSessionId, data), nfLogger.flush()
                        }), tester.on(events.ATTEMPT_START, function (data) {
                            testAttemptSessionId = nfLogger.startSession(MEASURE_ATTEMPT_SESSION, data)
                        }), tester.on(events.ATTEMPT_END, function (data) {
                            endMeasureSession(testAttemptSessionId, data)
                        }), tester.on(events.CONNECTION_START, function (data) {
                            var oca = data.oca;
                            connectionSessionIds[oca] = nfLogger.startSession(CONNECTION_SESSION, data), connectionEvents[oca] = []
                        }), tester.on(events.CONNECTION_PROGRESS, function (data) {
                            var oca = data.oca;
                            connectionEvents[oca] && connectionEvents[oca].push({
                                bytes: data.bytes,
                                start: data.start,
                                end: data.end
                            })
                        }), tester.on(events.CONNECTION_END, function (data) {
                            endConnectionSession(data.oca, data)
                        }), tester.on(events.URL_REQUEST_START, function (data) {
                            getUrlSessionIds.push(nfLogger.startSession(URL_REQUEST_SESSION, data))
                        }), tester.on(events.URL_REQUEST_END, function (data) {
                            var sessionId = getUrlSessionIds[0];
                            sessionId && (data.type = endSessionType(data), nfLogger.endSession(sessionId, data), getUrlSessionIds.shift())
                        }), tester.on(events.LATENCY_END, function (data) {
                            var oca = data.oca;
                            latencyEvents[oca] || (latencyEvents[oca] = []), latencyEvents[oca].push(data)
                        }), tester.on(events.PROGRESS, function (data) {
                            progressEvents.push(data)
                        }), tester.on(events.SNAPSHOT, function (data) {
                            snapshotEvents.push(data)
                        }), tester.on(events.AFTER_COMPLETE_ATTEMPT_START, function (data) {
                            afterCompleteSessionId = nfLogger.startSession(AFTER_COMPLETE_SESSION, data)
                        }), tester.on(events.AFTER_COMPLETE_ATTEMPT_END, function (data) {
                            endMeasureSession(afterCompleteSessionId, data), nfLogger.flush()
                        }), tester.on(events.ANY, function (data) {}))
                    },
                    endLogging: function () {
                        loggingEnabled && (loggingEnabled = !1)
                    },
                    getLogger: function () {
                        return nfLogger
                    },
                    flush: function () {
                        nfLogger.flush()
                    }
                }
            }
            module.exports = logger
        }), require.define("/node_modules/nf-cl-logger/package.json", function (require, module) {
            module.exports = {
                main: "index.js"
            }
        }), require.define("/node_modules/nf-cl-logger/index.js", function (require, module) {
            "use strict";
            module.exports = require("./src/logger")
        }), require.define("/node_modules/nf-cl-logger/src/logger.js", function (require, module) {
            "use strict";

            function createCompactLogger(optionsArg) {
                var options = optionsArg || {};
                return options.version = options.version || "2.0", options.envelopeName = options.envelopeName || "CompactConsolidatedLoggingEnvelope", new Logger(options)
            }
            var Logger = require("./logger-core");
            module.exports = createCompactLogger
        }), require.define("/node_modules/nf-cl-logger/src/logger-core.js", function (require, module) {
            "use strict";

            function Logger() {
                this._init.apply(this, arguments)
            }
            var SCHEMA = require("nf-cl-schema-ui"),
                VERSION = "2.0.3",
                MAX_BITS_COUNT = 53,
                INCREMENTING_BITS_COUNT = 28,
                RANDOM_BITS_COUNT = MAX_BITS_COUNT - INCREMENTING_BITS_COUNT,
                INCREMENTING_BITS_MASK = Math.pow(2, INCREMENTING_BITS_COUNT) - 1,
                RANDOM_BITS_SHIFT = Math.pow(2, RANDOM_BITS_COUNT);
            Logger.prototype = {
                constructor: Logger,
                batchInterval: 3e4,
                batchSize: 50,
                timeOffset: 0,
                source: "",
                requestSender: null,
                getClientTime: null,
                addContext: function (type, data) {
                    var context = this._initContext([type], data);
                    return this._state.pending[context.id] = context, context.id
                },
                removeContext: function (id) {
                    return this._state.pending[id] ? (delete this._state.pending[id], id) : this._state.current[id] ? (this._state.currentDelta.push(this._state.current[id]), delete this._state.current[id], id) : null
                },
                logEvent: function (type, data) {
                    var context = this._initEventContext([type, "DiscreteEvent"], data);
                    return this._snapshot(context), context.id
                },
                startSession: function (type, data) {
                    var context = this._initEventContext([type, "Session"], data);
                    return this._state.current[context.id] = context, this._snapshot(), context.id
                },
                endSession: function (sessionId, data) {
                    var startContext = this._state.current[sessionId];
                    if (startContext) {
                        var type = data && data.type ? [data.type, "SessionEnded"] : ["SessionEnded"],
                            endContext = this._initEventContext(type, data);
                        return endContext.duration = endContext.time - startContext.time, endContext.sessionId = sessionId, delete this._state.current[sessionId], this._snapshot(endContext, startContext), sessionId
                    }
                    return null
                },
                flush: function () {
                    var state = this._state;
                    if (!state.ending && state.snapshots && state.snapshots.length) {
                        var envelope = {
                            currentState: state.current,
                            reverseDeltas: state.snapshots,
                            type: "CompactConsolidatedLoggingEnvelope",
                            version: 2,
                            clientSendTime: this._timestamp()
                        };
                        state.snapshots = [], this.requestSender(JSON.stringify(envelope))
                    }
                },
                serialize: function () {
                    var timer = this._batchTimeout;
                    this._batchTimeout = null;
                    var json = JSON.stringify(this);
                    return this._batchTimeout = timer, json
                },
                sever: function (severedContext) {
                    this.end(severedContext || "Severed"), this._init(this)
                },
                end: function (endingContext) {
                    endingContext && this.addContext(endingContext), this._state.ending = !0, this._stopBatching();
                    for (var keys = Object.keys(this._state.current).sort(function (a, b) {
                            return b - a
                        }), logId = keys.pop(), i = 0; i < keys.length; i++) {
                        var context = this._state.current[keys[i]],
                            types = context.type;
                        "Session" === types[types.length - 1] && this.endSession(context.id, {
                            type: "SessionCanceled"
                        })
                    }
                    this.endSession(logId, {
                        type: "SessionEnded"
                    }), this._state.ending = !1, this.flush(), this._state = null
                },
                _init: function (options) {
                    this._initOptions(options), this._startBatching(), options.existingState || this._startLogSession(), this._logInitializedEvent()
                },
                _initOptions: function (options) {
                    options.existingState ? this._restore(options.existingState) : this._initState(), this._initProperties(options)
                },
                _initState: function () {
                    var state = {};
                    state.sequenceNumber = 0, state.lastIncrementingBits = 0, state.pending = {}, state.current = {}, state.snapshots = [], state.currentDelta = [], this._state = state
                },
                _startLogSession: function () {
                    this.startSession("Log", {
                        source: this.source,
                        schema: {
                            name: SCHEMA.name,
                            version: SCHEMA.version
                        }
                    })
                },
                _logInitializedEvent: function () {
                    this.logEvent("LoggerInitialized", {
                        version: VERSION
                    })
                },
                _restore: function (state) {
                    for (var existingState = JSON.parse(state), keys = Object.keys(existingState), i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        this[key] = existingState[key]
                    }
                },
                _initProperties: function (options) {
                    for (var option in this) "function" != typeof this[option] && options && "_" !== option.charAt(0) && (this[option] = "undefined" != typeof options[option] ? options[option] : this[option])
                },
                _copyData: function (data) {
                    var copy = {};
                    for (var field in data) copy[field] = data[field];
                    return copy
                },
                _initContext: function (type, data) {
                    var context;
                    return context = data ? this._copyData(data) : {}, context.type = SCHEMA && SCHEMA.types[type[0]] ? SCHEMA.types[type[0]] : type, context.id = this._getNextContextId(), context
                },
                _initEventContext: function (type, data) {
                    var context = this._initContext(type, data);
                    return context.sequence = ++this._state.sequenceNumber, "undefined" == typeof context.time && (context.time = this._timestamp()), context
                },
                _getClientTime: function () {
                    return (new Date).getTime()
                },
                _timestamp: function () {
                    var getTime = this.getClientTime || this._getClientTime;
                    return getTime() + this.timeOffset
                },
                _getNextContextId: function () {
                    var currentTimeInSeconds = Math.floor(this._timestamp() / 1e3),
                        incrBitsMask = INCREMENTING_BITS_MASK,
                        bitsShift = RANDOM_BITS_SHIFT,
                        incrementingBits = currentTimeInSeconds & incrBitsMask,
                        randomBits = Math.floor(Math.random() * bitsShift);
                    return incrementingBits <= this._state.lastIncrementingBits && (incrementingBits = this._state.lastIncrementingBits + 1), this._state.lastIncrementingBits = incrementingBits, incrementingBits * bitsShift + randomBits
                },
                _snapshot: function () {
                    for (var count = 1, current = this._state.current, pending = this._state.pending, pendingKeys = Object.keys(pending), i = 0; i < pendingKeys.length; i++) {
                        var key = pendingKeys[i];
                        current[key] = pending[key], count++
                    }
                    this._state.pending = {}, this._state.currentDelta.push(count), this._state.currentDelta = [], this._state.snapshots.push(this._state.currentDelta), arguments.length && this._state.currentDelta.push.apply(this._state.currentDelta, arguments), this._state.snapshots.length >= this.batchSize && this.flush()
                },
                _startBatching: function () {
                    var self = this;
                    self._batchTimeout = setTimeout(function () {
                        self.flush(), self._startBatching()
                    }, self.batchInterval)
                },
                _stopBatching: function () {
                    clearTimeout(this._batchTimeout), this._batchTimeout = null
                }
            }, module.exports = Logger
        }), require.define("/node_modules/nf-cl-schema-ui/package.json", function (require, module) {
            module.exports = {
                main: "dist/schema/nf-cl-schema-netflixApp.js"
            }
        }), require.define("/node_modules/nf-cl-schema-ui/dist/schema/nf-cl-schema-netflixApp.js", function (require, module) {
            module.exports = {
                version: "1.19.0",
                name: "netflixApp",
                types: {
                    AcceptTermsOfUse: ["AcceptTermsOfUse", "Action", "Session"],
                    AdaptiveEcomFallbackExperience: ["AdaptiveEcomFallbackExperience", "FallbackExperience"],
                    AddCachedVideo: ["AddCachedVideo", "Action", "Session"],
                    AddCachedVideoCommand: ["AddCachedVideoCommand", "Command", "Session"],
                    AddProfile: ["AddProfile", "Action", "Session"],
                    AddToPlaylist: ["AddToPlaylist", "Action", "Session"],
                    AddToPlaylistCommand: ["AddToPlaylistCommand", "Command", "Session"],
                    BackCommand: ["BackCommand", "Command", "Session"],
                    BoxartRenderCanceled: ["BoxartRenderCanceled", "BoxartRenderEnded", "DiscreteEvent"],
                    BoxartRenderFailed: ["BoxartRenderFailed", "BoxartRenderEnded", "DiscreteEvent"],
                    CachedPlay: ["CachedPlay", "Play", "Action", "Session"],
                    CancelCommand: ["CancelCommand", "Command", "Session"],
                    CancelMembership: ["CancelMembership", "Action", "Session"],
                    ChangeValueCommand: ["ChangeValueCommand", "Command", "Session"],
                    CloseApp: ["CloseApp", "Action", "Session"],
                    CloseAppCommand: ["CloseAppCommand", "Command", "Session"],
                    CloseCommand: ["CloseCommand", "Command", "Session"],
                    ConnectWithLineAccount: ["ConnectWithLineAccount", "Action", "Session"],
                    CreateAccount: ["CreateAccount", "Action", "Session"],
                    DeepLinkInput: ["DeepLinkInput", "UserInput"],
                    DeleteProfile: ["DeleteProfile", "Action", "Session"],
                    DirectedGestureInput: ["DirectedGestureInput", "GestureInput", "UserInput"],
                    Download: ["Download", "Action", "Session"],
                    EditPaymentCommand: ["EditPaymentCommand", "Command", "Session"],
                    EditPlanCommand: ["EditPlanCommand", "Command", "Session"],
                    EditProfile: ["EditProfile", "Action", "Session"],
                    EnterFullscreenCommand: ["EnterFullscreenCommand", "Command", "Session"],
                    EnterKidsModeCommand: ["EnterKidsModeCommand", "Command", "Session"],
                    ExitFullscreenCommand: ["ExitFullscreenCommand", "Command", "Session"],
                    ExitKidsModeCommand: ["ExitKidsModeCommand", "Command", "Session"],
                    FastForwardCommand: ["FastForwardCommand", "TrickplayCommand", "Command", "Session"],
                    FillVideoCommand: ["FillVideoCommand", "Command", "Session"],
                    FitVideoCommand: ["FitVideoCommand", "Command", "Session"],
                    ForwardCommand: ["ForwardCommand", "Command", "Session"],
                    GestureInput: ["GestureInput", "UserInput"],
                    HomeCommand: ["HomeCommand", "Command", "Session"],
                    KeyboardInput: ["KeyboardInput", "UserInput"],
                    LolomoDataModel: ["LolomoDataModel", "DataModel"],
                    MobileConnection: ["MobileConnection", "NetworkConnection"],
                    MuteCommand: ["MuteCommand", "Command", "Session"],
                    Navigate: ["Navigate", "Action", "Session"],
                    NavigateBackward: ["NavigateBackward", "Navigate", "Action", "Session"],
                    NavigateForward: ["NavigateForward", "Navigate", "Action", "Session"],
                    NetflixId: ["NetflixId", "ProfileIdentity", "Session"],
                    NotifyUms: ["NotifyUms", "Action", "Session"],
                    PauseCommand: ["PauseCommand", "TrickplayCommand", "Command", "Session"],
                    PauseDownloadCommand: ["PauseDownloadCommand", "Command", "Session"],
                    Play: ["Play", "Action", "Session"],
                    PlayCommand: ["PlayCommand", "Command", "Session"],
                    PlayNextCommand: ["PlayNextCommand", "Command", "Session"],
                    PointerInput: ["PointerInput", "UserInput"],
                    PrepareOnramp: ["PrepareOnramp", "Action", "Session"],
                    PreparePlay: ["PreparePlay", "Action", "Session"],
                    ProcessStateTransition: ["ProcessStateTransition", "Action", "Session"],
                    ProfileGuid: ["ProfileGuid", "ProfileIdentity", "Session"],
                    PushNotificationAcknowledged: ["PushNotificationAcknowledged", "PushNotificationResolved", "DiscreteEvent"],
                    PushNotificationDismissed: ["PushNotificationDismissed", "PushNotificationAcknowledged", "PushNotificationResolved", "DiscreteEvent"],
                    PushNotificationIgnored: ["PushNotificationIgnored", "PushNotificationResolved", "DiscreteEvent"],
                    RedeemGiftCard: ["RedeemGiftCard", "Action", "Session"],
                    RedeemGiftCardCommand: ["RedeemGiftCardCommand", "Command", "Session"],
                    RegisterForPushNotifications: ["RegisterForPushNotifications", "Action", "Session"],
                    RemoveAllCachedVideosCommand: ["RemoveAllCachedVideosCommand", "Command", "Session"],
                    RemoveCachedVideo: ["RemoveCachedVideo", "Action", "Session"],
                    RemoveCachedVideoAndPlayNextCommand: ["RemoveCachedVideoAndPlayNextCommand", "Command", "Session"],
                    RemoveCachedVideoCommand: ["RemoveCachedVideoCommand", "Command", "Session"],
                    RemoveDownloadDevice: ["RemoveDownloadDevice", "Action", "Session"],
                    RemoveFromPlaylist: ["RemoveFromPlaylist", "Action", "Session"],
                    RemoveFromPlaylistCommand: ["RemoveFromPlaylistCommand", "Command", "Session"],
                    RemoveFromViewingActivity: ["RemoveFromViewingActivity", "Action", "Session"],
                    RenderNavigationLevel: ["RenderNavigationLevel", "Action", "Session"],
                    RequestSharedCredentials: ["RequestSharedCredentials", "Action", "Session"],
                    ResumeDownloadCommand: ["ResumeDownloadCommand", "Command", "Session"],
                    RetryDownloadCommand: ["RetryDownloadCommand", "Command", "Session"],
                    RewindCommand: ["RewindCommand", "TrickplayCommand", "Command", "Session"],
                    Search: ["Search", "Action", "Session"],
                    SearchCommand: ["SearchCommand", "Command", "Session"],
                    SearchSuggestionResults: ["SearchSuggestionResults", "DataModel"],
                    SearchSuggestionTitleResults: ["SearchSuggestionTitleResults", "DataModel"],
                    SearchTitleResults: ["SearchTitleResults", "DataModel"],
                    SeekCommand: ["SeekCommand", "TrickplayCommand", "Command", "Session"],
                    SelectCommand: ["SelectCommand", "Command", "Session"],
                    SelectPlan: ["SelectPlan", "Action", "Session"],
                    SelectProfile: ["SelectProfile", "Action", "Session"],
                    SetStarRating: ["SetStarRating", "Action", "Session"],
                    SetThumbRating: ["SetThumbRating", "Action", "Session"],
                    SeveredForVppa: ["SeveredForVppa", "Severed"],
                    SeveredForWebpageUnload: ["SeveredForWebpageUnload", "Severed"],
                    Share: ["Share", "Action", "Session"],
                    ShareCommand: ["ShareCommand", "Command", "Session"],
                    SignIn: ["SignIn", "Action", "Session"],
                    SignInCommand: ["SignInCommand", "Command", "Session"],
                    SignOut: ["SignOut", "Action", "Session"],
                    SignOutCommand: ["SignOutCommand", "Command", "Session"],
                    SignUpCommand: ["SignUpCommand", "Command", "Session"],
                    SkipAheadCommand: ["SkipAheadCommand", "TrickplayCommand", "Command", "Session"],
                    SkipBackCommand: ["SkipBackCommand", "TrickplayCommand", "Command", "Session"],
                    SkipCommand: ["SkipCommand", "Command", "Session"],
                    StartAppExperience: ["StartAppExperience", "Action", "Session"],
                    StartMembership: ["StartMembership", "Action", "Session"],
                    StartMembershipCommand: ["StartMembershipCommand", "Command", "Session"],
                    StartPlay: ["StartPlay", "Action", "Session"],
                    StoreSharedCredentials: ["StoreSharedCredentials", "Action", "Session"],
                    SubmitCommand: ["SubmitCommand", "Command", "Session"],
                    SubmitOnrampResults: ["SubmitOnrampResults", "Action", "Session"],
                    ThrottleSearch: ["ThrottleSearch", "Action", "Session"],
                    UnmuteCommand: ["UnmuteCommand", "Command", "Session"],
                    UnpauseCommand: ["UnpauseCommand", "TrickplayCommand", "Command", "Session"],
                    UpdatePaymentInfo: ["UpdatePaymentInfo", "Action", "Session"],
                    ValidateInput: ["ValidateInput", "Action", "Session"],
                    ValidateMemberId: ["ValidateMemberId", "Action", "Session"],
                    ValidatePin: ["ValidatePin", "Action", "Session"],
                    ViewAccountMenuCommand: ["ViewAccountMenuCommand", "Command", "Session"],
                    ViewAudioSubtitlesSelectorCommand: ["ViewAudioSubtitlesSelectorCommand", "Command", "Session"],
                    ViewCachedVideosCommand: ["ViewCachedVideosCommand", "Command", "Session"],
                    ViewCategoriesCommand: ["ViewCategoriesCommand", "Command", "Session"],
                    ViewDetailsCommand: ["ViewDetailsCommand", "Command", "Session"],
                    ViewEpisodesSelectorCommand: ["ViewEpisodesSelectorCommand", "Command", "Session"],
                    ViewPreviewsCommand: ["ViewPreviewsCommand", "Command", "Session"],
                    ViewProfilesCommand: ["ViewProfilesCommand", "Command", "Session"],
                    ViewSettingsCommand: ["ViewSettingsCommand", "Command", "Session"],
                    ViewTitlesCommand: ["ViewTitlesCommand", "Command", "Session"],
                    VisitorDeviceId: ["VisitorDeviceId", "AccountIdentity", "Session"],
                    VoiceInput: ["VoiceInput", "UserInput"],
                    WatchCreditsCommand: ["WatchCreditsCommand", "Command", "Session"],
                    WifiConnection: ["WifiConnection", "NetworkConnection"],
                    WiredConnection: ["WiredConnection", "NetworkConnection"],
                    "android.SystemBackCommand": ["android.SystemBackCommand", "Command", "Session"],
                    "cs.Call": ["cs.Call", "Action", "Session"],
                    "cs.CallCommand": ["cs.CallCommand", "Command", "Session"],
                    "cs.EndCallCommand": ["cs.EndCallCommand", "Command", "Session"],
                    "edx.AlertsOperation": ["edx.AlertsOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.ApiOperation": ["edx.ApiOperation", "Action", "Session"],
                    "edx.AtlasOperation": ["edx.AtlasOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.ChronosOperation": ["edx.ChronosOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.CommandLineInterface": ["edx.CommandLineInterface", "Action", "Session"],
                    "edx.DashboardsOperation": ["edx.DashboardsOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.ElasticSearchOperation": ["edx.ElasticSearchOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.GitOperation": ["edx.GitOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.HttpRequest": ["edx.HttpRequest", "Action", "Session"],
                    "edx.KeymasterOperation": ["edx.KeymasterOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.MantisOperation": ["edx.MantisOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.NodeQuarkIndexOperation": ["edx.NodeQuarkIndexOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.PagerDutyOperation": ["edx.PagerDutyOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.PrimerIndexOperation": ["edx.PrimerIndexOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.PrimerOperation": ["edx.PrimerOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.RavenOperation": ["edx.RavenOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.SkipperOperation": ["edx.SkipperOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.SpinnakerOperation": ["edx.SpinnakerOperation", "edx.ApiOperation", "Action", "Session"],
                    "edx.TitusOperation": ["edx.TitusOperation", "edx.ApiOperation", "Action", "Session"],
                    "iko.EndCommand": ["iko.EndCommand", "Command", "Session"],
                    "iko.EnterBattleCommand": ["iko.EnterBattleCommand", "Command", "Session"],
                    "iko.Presentation": ["iko.Presentation", "Presentation", "Session"],
                    "ios.DeepLinkInput": ["ios.DeepLinkInput", "UserInput"],
                    "ios.LoadConfigurationService": ["ios.LoadConfigurationService", "Action", "Session"],
                    "ios.LoadDownloadService": ["ios.LoadDownloadService", "Action", "Session"],
                    "ios.LoadIdentityService": ["ios.LoadIdentityService", "Action", "Session"],
                    "ios.LoadNrdService": ["ios.LoadNrdService", "Action", "Session"],
                    "ios.RegisterForPushNotifications": ["ios.RegisterForPushNotifications", "Action", "Session"],
                    "tvui.JankMeasurementReported": ["tvui.JankMeasurementReported", "MeasurementReported", "DiscreteEvent"],
                    "tvui.MetadataDownloadPlayDelay": ["tvui.MetadataDownloadPlayDelay", "tvui.PlayDelay", "Session"],
                    "tvui.PlatformPlayDelay": ["tvui.PlatformPlayDelay", "tvui.PlayDelay", "Session"],
                    "tvui.RequestImeCandidateList": ["tvui.RequestImeCandidateList", "Action", "Session"],
                    "tvui.UiPlayDelay": ["tvui.UiPlayDelay", "tvui.PlayDelay", "Session"],
                    "tvui.VideoPresentationPlayDelay": ["tvui.VideoPresentationPlayDelay", "tvui.PlayDelay", "Session"],
                    "www.ExtendedAreaFocus": ["www.ExtendedAreaFocus", "Focus", "Session"]
                }
            }
        }), require.define("/app/ui.js", function (require, module) {
            function convertSpeed(result) {
                var bitsPerS = result.speed,
                    speedMbs = bitsPerS / 1e3 / 1e3 || 0,
                    units = "Mbps";
                return 1 > speedMbs ? (speedMbs *= 1e3, units = "Kbps") : speedMbs >= 995 && (speedMbs /= 1e3, units = "Gbps"), speedMbs = 9.95 > speedMbs ? (Math.round(10 * speedMbs) / 10).toFixed(1) : 100 > speedMbs ? Math.round(speedMbs) : 10 * Math.round(speedMbs / 10), {
                    speed: speedMbs,
                    units: units
                }
            }

            function convertToMB(result) {
                var mb = result.bytes / 1e3 / 1e3;
                return mb = mb > 1 ? 10 > mb ? (Math.round(10 * mb) / 10).toFixed(1) : 10 * Math.round(mb / 10) : (Math.round(100 * mb) / 100).toFixed(2)
            }

            function convertLatency(result) {
                var units = "ms",
                    latency = result.value;
                return 0 !== latency && !latency && result.latency && (latency = result.latency.value), 0 !== latency && !latency || latency > 1e6 ? {
                    speed: 0,
                    units: units
                } : (latency >= 1e3 ? (latency = (Math.round(latency / 1e3 * 10) / 10).toFixed(1), units = "s") : latency = Math.round(latency), {
                    speed: latency,
                    units: units
                })
            }
            var TEST_CONFIG = {
                    showAdvanced: {
                        "default": !1,
                        elem: "always-show-metrics-input"
                    },
                    measureUploadLatency: {
                        "default": !1,
                        elem: "measure-latency-during-upload"
                    },
                    minConnections: {
                        "default": 1,
                        testerFunc: function (config) {
                            return config.connections.min
                        },
                        elem: "min-connections-input"
                    },
                    maxConnections: {
                        "default": 8,
                        testerFunc: function (config) {
                            return config.connections.max
                        },
                        elem: "max-connections-input"
                    },
                    minDuration: {
                        "default": 5,
                        testerFunc: function (config) {
                            return config.duration.min
                        },
                        elem: "min-duration-input"
                    },
                    maxDuration: {
                        "default": 30,
                        testerFunc: function (config) {
                            return config.duration.max
                        },
                        elem: "max-duration-input"
                    },
                    shouldPersist: {
                        "default": !1,
                        elem: "persist-config-input"
                    }
                },
                ui = function (tester, logger) {
                    function getElement(elementId) {
                        var element;
                        return element || (elemCache[elementId] = element = document.getElementById(elementId)), element
                    }

                    function hideElement(element) {
                        return element.setAttribute("style", "display: none"), element
                    }

                    function showElement(element) {
                        return element.setAttribute("style", "display: block"), element
                    }

                    function removeClass(element, className) {
                        return element.className = element.className.replace(new RegExp("(\\s|^)" + className + "(\\s|$)", "g"), " "), element
                    }

                    function addClass(element, className) {
                        element.className;
                        return hasClass(element, className) || (element.className += " " + className), element
                    }

                    function hasClass(element, className) {
                        var curClass = element.className;
                        return -1 !== curClass.search(new RegExp("(\\s|^)" + className + "(\\s|$)"))
                    }

                    function toggleClass(element, className) {
                        hasClass(element, className) ? removeClass(element, className) : addClass(element, className)
                    }

                    function localizePage(language, localized) {
                        var i, key, elem, localizedElems = document.getElementsByClassName("localized"),
                            alignElems = document.getElementsByClassName("align-container"),
                            localizedLang = localized[language],
                            rightAligned = localizedLang.rightAligned,
                            messageContentElem = getElement("share-msg");
                        for (i = 0; i < localizedElems.length; i++) elem = localizedElems[i], key = elem.getAttribute("loc-str"), elem.innerHTML = localizedLang[key];
                        for (messageContentElem.setAttribute("my-speed", localizedLang.my_internet_speed), messageContentElem.setAttribute("your-speed", localizedLang.your_internet_speed), messageContentElem.setAttribute("yours-speed", localizedLang.how_fast_is_yours), messageContentElem.setAttribute("share-on-fb", localizedLang.share_on_facebook), messageContentElem.setAttribute("share-on-tw", localizedLang.share_on_twitter), i = 0; i < alignElems.length; ++i) elem = alignElems[i], rightAligned ? addClass(elem, "right-aligned-text") : removeClass(elem, "right-aligned-text")
                    }

                    function setupHelp() {
                        {
                            var testHelpElem = getElement("test-help-btn"),
                                helpContentElem = getElement("help-content");
                            getElement("language-selector-container")
                        }
                        utils.addEventListener(testHelpElem, "click", function () {
                            testHelpElem.active ? (removeClass(testHelpElem.children[0], "active"), testHelpElem.active = !1, hideElement(helpContentElem)) : (addClass(testHelpElem.children[0], "active"), testHelpElem.active = !0, showElement(helpContentElem), setTimeout(function () {
                                scrollToElement(testHelpElem)
                            }, 0), logger.logEvent("HelpPresented", {
                                view: "Help"
                            }))
                        })
                    }

                    function setupLanguageControls() {
                        function addLanguageChangeListener(elem) {
                            utils.addEventListener(elem, "click", function (event) {
                                event.preventDefault();
                                var language = elem.innerText,
                                    langPath = elem.getAttribute("language");
                                if (window.localized) localizePage(langPath, window.localized), utils.removeEventListener(languageSelectorBtn, toggleSelector), languageSelectorBtn.innerHTML = languageSelectorBtn.innerHTML.replace(languageSelectorBtn.innerText, language), utils.addEventListener(languageSelectorBtn, "click", toggleSelector), curLang = langPath;
                                else {
                                    var xhr = utils.getXHR(),
                                        path = localizedPath;
                                    xhr.onreadystatechange = function () {
                                        4 !== this.readyState || 200 !== this.status && 304 !== this.status || (window.localized = JSON.parse(this.responseText), localizePage(langPath, window.localized), utils.removeEventListener(languageSelectorBtn, toggleSelector), languageSelectorBtn.innerHTML = languageSelectorBtn.innerHTML.replace(languageSelectorBtn.innerText, language), utils.addEventListener(languageSelectorBtn, "click", toggleSelector), curLang = langPath)
                                    }, (!window.location || "localhost" != window.location.hostname && "https:" !== window.location.protocol) && (path = "https://fast.com" + path), xhr.open("GET", path, !0), xhr.onerror = function (e) {}, logger.logEvent("LanguageChangeStart", {
                                        from: curLang,
                                        to: langPath
                                    }), setTimeout(function () {
                                        xhr && xhr.send()
                                    }, 0)
                                }
                            })
                        }

                        function toggleSelector() {
                            var languageSelector = getElement("language-selector"),
                                languageSelectorIcon = getElement("language-selector-icon");
                            toggleClass(languageSelector, "show"), toggleClass(languageSelectorIcon, "oc-icon-keyboard_arrow_down"), toggleClass(languageSelectorIcon, "oc-icon-keyboard_arrow_up")
                        }
                        var localizedPath = "/localized.json";
                        window && window.document && window.document.body && (localizedPath = window.document.body.getAttribute("localized")); {
                            var languageSelectorBtn = getElement("language-selector-btn");
                            getElement("help-content"), getElement("your-speed-message"), getElement("compare-on")
                        }
                        utils.addEventListener(languageSelectorBtn, "click", toggleSelector), utils.addEventListener(document, "click", function (event) {
                            var target = event.target || event.srcElement,
                                languageSelector = getElement("language-selector");
                            hasClass(target, "dropbtn") || hasClass(languageSelector, "show") && toggleSelector()
                        });
                        var elem, elemInd, languageOptions = document.querySelectorAll(".language-option");
                        for (elemInd = 0; elemInd < languageOptions.length; ++elemInd) elem = languageOptions[elemInd], addLanguageChangeListener(elem)
                    }

                    function pause() {
                        tester.isRunning() && tester.stop(), utils.addEventListener(pauseElem, "click", restartTest)
                    }

                    function setupPause() {
                        utils.removeEventListener(pauseElem, "click", restartTest), utils.removeEventListener(pauseElem, "click", pause), utils.addEventListener(pauseElem, "click", pause)
                    }

                    function restartTest() {
                        tester.isRunning() && tester.stop(), setupPause(), reset(), tester.download()
                    }

                    function setupAfterTestActions() {
                        var actionsElem = getElement("after-test-actions"),
                            speedMsg = getElement("your-speed-message");
                        showElement(actionsElem), showElement(speedMsg), showElement(resultsExplanationElem), showingMoreDetails || showElement(showMoreDetailsBtn)
                    }

                    function reset() {
                        var speedElem = getElement("speed-value"),
                            speedUnitsElem = getElement("speed-units"),
                            speedProgressIndicator = getElement("speed-progress-indicator"),
                            speedProgressIndicatorIcon = getElement("speed-progress-indicator-icon"),
                            actionsElem = getElement("after-test-actions"),
                            unstableResultsElem = getElement("unstable-results-msg"),
                            testErrorElem = getElement("error-results-msg"),
                            speedMsg = getElement("your-speed-message"),
                            infoElem = getElement("test-info-container"),
                            latencyElem = getElement("latency-value"),
                            latencyUnitsElem = getElement("latency-units"),
                            latencyLabelElem = getElement("latency-label"),
                            bufferbloatElem = getElement("bufferbloat-value"),
                            bufferbloatUnitsElem = getElement("bufferbloat-units"),
                            bufferbloatLabelElem = getElement("bufferbloat-label"),
                            bytesDownElem = getElement("down-mb-value"),
                            bytesUpElem = getElement("up-mb-value"),
                            uploadElem = getElement("upload-value"),
                            uploadUnitsElem = getElement("upload-units"),
                            uploadLabelElem = getElement("upload-label");
                        hideElement(actionsElem), hideElement(unstableResultsElem), hideElement(testErrorElem), hideElement(speedMsg), hideElement(showMoreDetailsBtn), speedElem.innerHTML = 0, speedUnitsElem.innerHTML = "&nbsp", removeClass(detailsElem, "succeeded"), removeClass(latencyContainer, "succeeded"), removeClass(speedElem, "succeeded"), removeClass(speedElem, "failed"), removeClass(speedUnitsElem, "succeeded"), removeClass(speedUnitsElem, "failed"), removeClass(speedProgressIndicator, "succeeded"), removeClass(speedProgressIndicator, "stopped"), removeClass(speedProgressIndicator, "failed"), addClass(speedProgressIndicator, "in-progress"), removeClass(speedProgressIndicatorIcon, "oc-icon-refresh"), addClass(speedProgressIndicatorIcon, "oc-icon-pause"), removeClass(infoElem, "succeeded"), removeClass(infoElem, "failed"), removeClass(latencyElem, "succeeded"), removeClass(latencyElem, "failed"), removeClass(latencyUnitsElem, "succeeded"), removeClass(latencyUnitsElem, "failed"), removeClass(latencyLabelElem, "succeeded"), removeClass(latencyLabelElem, "failed"), removeClass(bufferbloatElem, "succeeded"), removeClass(bufferbloatElem, "failed"), removeClass(bufferbloatUnitsElem, "succeeded"), removeClass(bufferbloatUnitsElem, "failed"), removeClass(bufferbloatLabelElem, "succeeded"), removeClass(bufferbloatLabelElem, "failed"), removeClass(uploadElem, "succeeded"), removeClass(uploadElem, "failed"), removeClass(uploadUnitsElem, "succeeded"), removeClass(uploadUnitsElem, "failed"), removeClass(uploadLabelElem, "succeeded"), removeClass(uploadLabelElem, "failed"), latencyElem.innerHTML = "0", bufferbloatElem.innerHTML = "0", uploadElem.innerHTML = "0", bytesDownElem.innerHTML = "0", bytesUpElem.innerHTML = "0"
                    }

                    function scrollToElement(elem) {
                        function findPos(obj) {
                            var curtop = 0;
                            if (obj.offsetParent) {
                                do curtop += obj.offsetTop; while (obj == obj.offsetParent);
                                return curtop
                            }
                        }
                        elem.scrollIntoView ? elem.scrollIntoView() : window.scroll(0, findPos(elem))
                    }

                    function popupCenter(url, title, w, h) {
                        var dualScreenLeft = void 0 !== window.screenLeft ? window.screenLeft : screen.left,
                            dualScreenTop = void 0 !== window.screenTop ? window.screenTop : screen.top,
                            width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width,
                            height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height,
                            left = width / 2 - w / 2 + dualScreenLeft,
                            top = height / 2 - h / 2 + dualScreenTop,
                            newWindow = window.open(url, title, "scrollbars=yes, width=" + w + ", height=" + h + ", top=" + top + ", left=" + left);
                        newWindow.focus && newWindow.focus()
                    }
                    var fbShareEventListener, twShareEventListener, fbShareBtn, twShareBtn, showMoreDetailsBtn, testAgainBtn, resultsExplanationElem, configContainerElem, detailsElem, latencyContainer, pauseElem, downloadResult, showingMoreDetails, config, elemCache = {},
                        utils = require("./utils"),
                        events = require("./event").events,
                        curLang = document.body.getAttribute("language"),
                        canUseLocalStorage = !1;
                    try {
                        window && window.localStorage && (window.localStorage.__test__ = 1, canUseLocalStorage = !0)
                    } catch (e) {}
                    var showMoreDetails = function () {
                            if (logger.logEvent("AdvancedMetricsPresented"), tester.isRunning()) {
                                var speedProgressIndicator = getElement("speed-progress-indicator"),
                                    speedProgressIndicatorIcon = getElement("speed-progress-indicator-icon");
                                removeClass(speedProgressIndicator, "succeeded"), removeClass(speedProgressIndicator, "stopped"), removeClass(speedProgressIndicator, "failed"), addClass(speedProgressIndicator, "in-progress"), removeClass(speedProgressIndicatorIcon, "oc-icon-refresh"), addClass(speedProgressIndicatorIcon, "oc-icon-pause"), setupPause()
                            }
                            showingMoreDetails = !0, hideElement(showMoreDetailsBtn), showElement(detailsElem)
                        },
                        hideMoreDetails = function () {
                            hideElement(detailsElem), showElement(showMoreDetailsBtn), showingMoreDetails = !1
                        },
                        updateClientInfo = function (event) {
                            var locationsStr, curLocation, i, client = event.client,
                                locationsMap = {};
                            for (getElement("user-ip").innerHTML = client.ip, getElement("user-isp").innerHTML = client.isp ? client.isp.replace(/_/g, " ") : "", getElement("user-location").innerHTML = client.location.city + ", " + client.location.country, curLocation = client.servers[0].location.city + ", " + client.servers[0].location.country, locationsStr = curLocation, locationsMap[curLocation] = !0, i = 1; i < Math.min(client.servers.length, 3); ++i) curLocation = client.servers[i].location.city + ", " + client.servers[i].location.country, locationsMap[curLocation] || (locationsStr += "&nbsp&nbsp|&nbsp&nbsp" + curLocation, locationsMap[curLocation] = !0);
                            getElement("server-locations").innerHTML = locationsStr
                        },
                        showConfig = function () {
                            logger.logEvent("SettingsPresented"), renderConfig(config), hideElement(detailsElem), showElement(configContainerElem)
                        },
                        cancelConfig = function () {
                            hideElement(configContainerElem), config.showAdvanced === !0 || "true" === config.showAdvanced ? showMoreDetails() : hideMoreDetails()
                        },
                        applyConfig = function () {
                            var currentConfig = getTestSettings(tester),
                                shouldPersist = getElement(TEST_CONFIG.shouldPersist.elem).checked;
                            for (var name in TEST_CONFIG) {
                                var testerValue = getElement(TEST_CONFIG[name].elem);
                                testerValue && (config[name] = "boolean" == typeof TEST_CONFIG[name].default ? testerValue.checked : testerValue.value, shouldPersist && canUseLocalStorage && (window.localStorage[name] = String(config[name])))
                            }
                            try {
                                applyTesterConfig(config), hideElement(configContainerElem), config.showAdvanced === !0 || "true" === config.showAdvanced ? showMoreDetails() : hideMoreDetails(), restartTest()
                            } catch (e) {
                                alert(e.message), renderConfig(currentConfig)
                            }
                        },
                        resetConfig = function () {
                            var defaultConfig = {};
                            for (var name in TEST_CONFIG) defaultConfig[name] = TEST_CONFIG[name].default, canUseLocalStorage && delete window.localStorage[name];
                            applyTesterConfig(defaultConfig), config = getTestSettings(tester), renderConfig(config)
                        },
                        renderConfig = function (config) {
                            for (var name in TEST_CONFIG) {
                                var testerValue = getElement(TEST_CONFIG[name].elem);
                                "boolean" == typeof TEST_CONFIG[name].default ? testerValue.checked = config[name] === !0 || "true" === config[name] : testerValue.value = config[name]
                            }
                        },
                        getTestSettings = function (tester) {
                            var config = {},
                                testerConfig = tester.config();
                            if (canUseLocalStorage)
                                for (var name in TEST_CONFIG) {
                                    var testerValue;
                                    TEST_CONFIG[name].testerFunc && (testerValue = TEST_CONFIG[name].testerFunc(testerConfig)), config[name] = window.localStorage[name] || testerValue || TEST_CONFIG[name].default
                                }
                            return config
                        },
                        applyTesterConfig = function (config) {
                            var testerConfig = {};
                            return testerConfig.connections = {
                                min: parseInt(config.minConnections),
                                max: parseInt(config.maxConnections)
                            }, testerConfig.duration = {
                                min: parseInt(config.minDuration),
                                max: parseInt(config.maxDuration)
                            }, tester.setConfig(testerConfig), testerConfig
                        },
                        that = {
                            onProgress: function (result) {
                                var updateMetric = function (testType) {
                                    var speedElemId, speedUnitId, speedData, speed, speedElem, speedUnitsElem, bytesElemId, bytesElem, convertFunc;
                                    "download" == testType ? (speedElemId = "speed-value", bytesElemId = "down-mb-value", speedUnitId = "speed-units", convertFunc = convertSpeed) : "upload" == testType ? (speedElemId = "upload-value", bytesElemId = "up-mb-value", speedUnitId = "upload-units", convertFunc = convertSpeed) : "latency" == testType ? (speedElemId = "latency-value", speedUnitId = "latency-units", convertFunc = convertLatency) : "bufferbloat" == testType && (speedElemId = "bufferbloat-value", speedUnitId = "bufferbloat-units", convertFunc = convertLatency), speedElem = getElement(speedElemId), speedUnitsElem = getElement(speedUnitId), bytesElemId && (bytesElem = getElement(bytesElemId), bytesElem.innerHTML = convertToMB(result)), speedData = convertFunc(result), speed = speedData.speed + speedData.units, speedElem && (speedElem.innerHTML = speedData.speed), speedUnitsElem && (speedUnitsElem.innerHTML = speedData.units)
                                };
                                updateMetric(result.testType), "download" === result.testType && updateMetric("bufferbloat"), "true" !== config.measureUploadLatency && config.measureUploadLatency !== !0 || "upload" !== result.testType || updateMetric("bufferbloat")
                            },
                            onComplete: function (result) {
                                var className, speedElemId, speedUnitId, speedLabelId, speedElem, speedUnitsElem, speedLabelElem, unstableResultsElem, testErrorElem, testType = result.testType,
                                    speedProgressIndicator = getElement("speed-progress-indicator"),
                                    speedProgressIndicatorIcon = getElement("speed-progress-indicator-icon"),
                                    showAfterTestActions = !1;
                                if (downloadResult = result, "download" == testType ? (speedElemId = "speed-value", speedUnitId = "speed-units", speedLabelId = "speed-value", showAfterTestActions = !0, convertFunc = convertSpeed) : "upload" == testType ? (speedElemId = "upload-value", speedUnitId = "upload-units", speedLabelId = "upload-label", convertFunc = convertSpeed) : "latency" == testType ? (speedElemId = "latency-value", speedUnitId = "latency-units", speedLabelId = "latency-label", convertFunc = convertLatency) : "bufferbloat" == testType && (speedElemId = "bufferbloat-value", speedUnitId = "bufferbloat-units", speedLabelId = "bufferbloat-label", convertFunc = convertLatency), speedElem = getElement(speedElemId), speedUnitsElem = getElement(speedUnitId), speedLabelElem = getElement(speedLabelId), "success" === result.result ? (that.onProgress(result), result.stable ? className = "succeeded" : (className = "failed", unstableResultsElem = getElement("unstable-results-msg"), showElement(unstableResultsElem))) : "stop" !== result.result ? (testErrorElem = getElement("error-results-msg"), showElement(testErrorElem), className = "failed") : (className = "stopped", showAfterTestActions = !1), showAfterTestActions && setupAfterTestActions(), ("download" === testType && !showingMoreDetails || "upload" === testType || "stop" === result.result) && (removeClass(speedProgressIndicator, "in-progress"), removeClass(speedProgressIndicatorIcon, "oc-icon-pause"), addClass(speedProgressIndicatorIcon, "oc-icon-refresh"), addClass(speedProgressIndicator, className), utils.removeEventListener(testAgainBtn, "click", pause), utils.addEventListener(testAgainBtn, "click", restartTest)), addClass(speedElem, className), addClass(speedUnitsElem, className), addClass(speedLabelElem, className), logger.flush(), "download" === testType && "success" === result.result) {
                                    var speedData = convertSpeed(result);
                                    fbShareBtn = getElement("share-on-facebook-link"), twShareBtn = getElement("share-on-twitter-link"), fbShareEventListener && utils.removeEventListener(fbShareBtn, "click", fbShareEventListener), twShareEventListener && utils.removeEventListener(fbShareBtn, "click", twShareEventListener), fbShareEventListener = function () {
                                        var location, targetUrl, facebookUrl, hostname, protocol, messageContentElem = getElement("share-msg"),
                                            shareDescription = messageContentElem.getAttribute("my-speed") + speedData.speed + speedData.units + ". " + messageContentElem.getAttribute("yours-speed"),
                                            shareTitle = messageContentElem.getAttribute("share-on-fb");
                                        location = window.location, hostname = location.hostname, protocol = location.protocol, "http:" !== location.protocol && "https:" !== location.protocol && (hostname = "fast.com", protocol = "https:"), targetUrl = protocol + "//" + hostname + "/" + curLang + "/share/" + speedData.speed + speedData.units + ".html", facebookUrl = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(targetUrl) + "&title=" + encodeURI("FAST speed test") + "&description=" + encodeURI(shareDescription), logger.logEvent("FacebookShare", {
                                            url: targetUrl
                                        }), popupCenter(facebookUrl, shareTitle, 400, 400)
                                    }, twShareEventListener = function () {
                                        var location, targetUrl, twitterUrl, hostname, protocol, messageContentElem = getElement("share-msg"),
                                            shareDescription = messageContentElem.getAttribute("my-speed") + " " + speedData.speed + speedData.units + ". " + messageContentElem.getAttribute("yours-speed"),
                                            shareTitle = messageContentElem.getAttribute("share-on-tw");
                                        location = window.location, hostname = location.hostname, protocol = location.protocol, "http:" !== location.protocol && "https:" !== location.protocol && (hostname = "fast.com", protocol = "https:"), targetUrl = protocol + "//" + hostname + "/" + curLang + "/share/" + speedData.speed + speedData.units + ".html", twitterUrl = "https://twitter.com/intent/tweet?url=" + encodeURI(targetUrl) + "&text=" + encodeURI(shareDescription), twitterUrl = twitterUrl.replace(/;/g, "%3B"), logger.logEvent("TwitterShare", {
                                            url: targetUrl
                                        }), popupCenter(twitterUrl, shareTitle, 400, 400)
                                    }, utils.addEventListener(fbShareBtn, "click", fbShareEventListener), utils.addEventListener(twShareBtn, "click", twShareEventListener);
                                    var infoElem = getElement("test-info-container"),
                                        showInfo = function (uploadResult) {
                                            tester.off(events.END, showInfo), "stop" !== uploadResult.result && (addClass(infoElem, "succeeded"), addClass(detailsElem, "succeeded"))
                                        },
                                        doUpload = function (latencyResult) {
                                            tester.off(events.END, doUpload), "stop" !== latencyResult.result && (addClass(latencyContainer, "succeeded"), !downloadResult || void 0 !== downloadResult.latency && null !== downloadResult.latency || (downloadResult.latency = downloadResult.latency || {
                                                value: "NA"
                                            }), that.onComplete({
                                                testType: "bufferbloat",
                                                stable: !0,
                                                value: downloadResult.latency.value,
                                                result: "success"
                                            }), tester.on(events.END, showInfo), tester.upload())
                                        };
                                    tester.on(events.END, doUpload), tester.latency()
                                }
                            },
                            setupEvents: function () {
                                var testConfigBtn, cancelConfigBtn, applyConfigBtn, resetConfigBtn;
                                config = getTestSettings(tester);
                                try {
                                    applyTesterConfig(config)
                                } catch (e) {
                                    resetConfig()
                                }
                                renderConfig(config), pauseElem = getElement("speed-progress-indicator"), fbShareBtn = getElement("share-on-facebook-link"), twShareBtn = getElement("share-on-twitter-link"), testAgainBtn = getElement("speed-progress-indicator"), showMoreDetailsBtn = getElement("show-more-details-link"), cancelConfigBtn = getElement("cancel-config"), applyConfigBtn = getElement("apply-config"), resetConfigBtn = getElement("reset-config"), testConfigBtn = getElement("settings-link"), resultsExplanationElem = getElement("test-context-container"), configContainerElem = getElement("test-config-container"), detailsElem = getElement("extra-details-container"), latencyContainer = getElement("latency-container"), setupHelp(), setupPause(), setupLanguageControls(), utils.addEventListener(showMoreDetailsBtn, "click", showMoreDetails), utils.addEventListener(testConfigBtn, "click", showConfig), utils.addEventListener(cancelConfigBtn, "click", cancelConfig), utils.addEventListener(applyConfigBtn, "click", applyConfig), utils.addEventListener(resetConfigBtn, "click", resetConfig), tester.on(events.URL_REQUEST_END, updateClientInfo), (config.showAdvanced === !0 || "true" === config.showAdvanced) && showMoreDetails()
                            }
                        };
                    return that
                };
            module.exports = ui
        }), require.define("/app/viewport-units-buggyfill.js", function (require, module, exports) {
            ! function (root, factory) {
                "use strict";
                "function" == typeof define && define.amd ? define([], factory) : "object" == typeof exports ? module.exports = factory() : root.viewportUnitsBuggyfill = factory()
            }(this, function () {
                "use strict";

                function debounce(func, wait) {
                    var timeout;
                    return function () {
                        var context = this,
                            args = arguments,
                            callback = function () {
                                func.apply(context, args)
                            };
                        clearTimeout(timeout), timeout = setTimeout(callback, wait)
                    }
                }

                function initialize(initOptions) {
                    if (!initialized) {
                        if (options = initOptions || {}, options.isMobileSafari = isMobileSafari, options.isBadStockAndroid = isBadStockAndroid, !isMobileSafari && !isBadStockAndroid && !isOperaMini) return window.console, window.console, {
                            init: function () {}
                        };
                        initialized = !0, styleNode = document.createElement("style"), styleNode.id = "patched-viewport", document.head.appendChild(styleNode);
                        var _refresh = debounce(refresh, options.refreshDebounceWait || 100);
                        window.addEventListener("orientationchange", _refresh, !0), window.addEventListener("pageshow", _refresh, !0), refresh()
                    }
                }

                function updateStyles() {
                    styleNode.textContent = getReplacedViewportUnits(), styleNode.parentNode.appendChild(styleNode)
                }

                function refresh() {
                    initialized && (findProperties(), setTimeout(function () {
                        updateStyles()
                    }, 1))
                }

                function processStylesheet(ss) {
                    try {
                        if (!ss.cssRules) return
                    } catch (e) {
                        if ("SecurityError" !== e.name) throw e;
                        return
                    }
                    for (var rules = [], i = 0; i < ss.cssRules.length; i++) {
                        var rule = ss.cssRules[i];
                        rules.push(rule)
                    }
                    return rules
                }

                function findProperties() {
                    return declarations = [], forEach.call(document.styleSheets, function (sheet) {
                        var cssRules = processStylesheet(sheet);
                        cssRules && "patched-viewport" !== sheet.ownerNode.id && (sheet.media && sheet.media.mediaText && window.matchMedia && !window.matchMedia(sheet.media.mediaText).matches || forEach.call(cssRules, findDeclarations))
                    }), declarations
                }

                function findDeclarations(rule) {
                    if (7 === rule.type) {
                        var value;
                        try {
                            value = rule.cssText
                        } catch (e) {
                            return
                        }
                        return viewportUnitExpression.lastIndex = 0, void(viewportUnitExpression.test(value) && declarations.push([rule, null, value]))
                    }
                    if (!rule.style) {
                        if (!rule.cssRules) return;
                        return void forEach.call(rule.cssRules, function (_rule) {
                            findDeclarations(_rule)
                        })
                    }
                    forEach.call(rule.style, function (name) {
                        var value = rule.style.getPropertyValue(name);
                        rule.style.getPropertyPriority(name) && (value += " !important"), viewportUnitExpression.lastIndex = 0, viewportUnitExpression.test(value) && declarations.push([rule, name, value])
                    })
                }

                function getReplacedViewportUnits() {
                    dimensions = getViewport();
                    var open, close, css = [],
                        buffer = [];
                    return declarations.forEach(function (item) {
                        var _item = overwriteDeclaration.apply(null, item),
                            _open = _item.selector.length ? _item.selector.join(" {\n") + " {\n" : "",
                            _close = new Array(_item.selector.length + 1).join("\n}");
                        return _open && _open === open ? (_open && !open && (open = _open, close = _close), void buffer.push(_item.content)) : (buffer.length && (css.push(open + buffer.join("\n") + close), buffer.length = 0), void(_open ? (open = _open, close = _close, buffer.push(_item.content)) : (css.push(_item.content), open = null, close = null)))
                    }), buffer.length && css.push(open + buffer.join("\n") + close), isOperaMini && css.push("* { content: normal !important; }"), css.join("\n\n")
                }

                function overwriteDeclaration(rule, name, value) {
                    var _value, _selectors = [];
                    _value = value.replace(viewportUnitExpression, replaceValues), name && (_selectors.push(rule.selectorText), _value = name + ": " + _value + ";");
                    for (var _rule = rule.parentRule; _rule;) _selectors.unshift("@media " + _rule.media.mediaText), _rule = _rule.parentRule;
                    return {
                        selector: _selectors,
                        content: _value
                    }
                }

                function replaceValues(match, number, unit) {
                    var _base = dimensions[unit],
                        _number = parseFloat(number) / 100;
                    return _number * _base + "px"
                }

                function getViewport() {
                    var vh = window.innerHeight,
                        vw = window.innerWidth;
                    return {
                        vh: vh,
                        vw: vw,
                        vmax: Math.max(vw, vh),
                        vmin: Math.min(vw, vh)
                    }
                }
                var options, dimensions, declarations, styleNode, initialized = !1,
                    userAgent = window.navigator.userAgent,
                    viewportUnitExpression = /([+-]?[0-9.]+)(vh|vw|vmin|vmax)/g,
                    forEach = [].forEach,
                    isOperaMini = userAgent.indexOf("Opera Mini") > -1,
                    isMobileSafari = /(iPhone|iPod|iPad).+AppleWebKit/i.test(userAgent) && function () {
                        var iOSversion = userAgent.match(/OS (\d)/);
                        return iOSversion && iOSversion.length > 1 && parseInt(iOSversion[1]) < 10
                    }(),
                    isBadStockAndroid = function () {
                        var isAndroid = userAgent.indexOf(" Android ") > -1;
                        if (!isAndroid) return !1;
                        var isStockAndroid = userAgent.indexOf("Version/") > -1;
                        if (!isStockAndroid) return !1;
                        var versionNumber = parseFloat((userAgent.match("Android ([0-9.]+)") || [])[1]);
                        return 4.4 >= versionNumber
                    }();
                return {
                    version: "0.6.0",
                    findProperties: findProperties,
                    getCss: getReplacedViewportUnits,
                    init: initialize,
                    refresh: refresh
                }
            })
        }), require.define("/app/browser_test.js", function (require) {
            function startTest() {
                tester.download()
            }

            function flushLogger(force) {
                !force && tester && tester.isRunning() || logger.flush()
            }
            var aggregator, stopper, testerFactory, tester, utils, events, requester, logging, logger, ui, apiEndpoint, loggingEndpoint;
            window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
                var l, errorData;
                errorData = {
                    message: errorMsg,
                    url: url,
                    line: lineNumber,
                    column: column
                }, errorObj && (errorData.error = {
                    name: errorObj.name,
                    stack: errorObj.stack,
                    data: errorObj
                }), logger && (l = logger.getLogger(), l.logEvent("ExceptionOccurred", errorData), flushLogger(!0))
            }, aggregator = require("./aggregator/stableMovingAverage")(5), stopper = require("./stopper/stableDeltaMeasurementsStopper")({
                minDuration: 7,
                maxDuration: 30,
                stabilityDelta: 2,
                minStableMeasurements: 6,
                measureLatency: !1
            }), testerFactory = require("./tester"), utils = require("./utils"), events = require("./event").events, requester = require("./requester/xhr"), logging = require("./logger"), apiEndpoint = "api.fast.com/netflix/speedtest/v2", loggingEndpoint = "https://ichnaea-web.netflix.com/cl2", window.console || (console = {
                log: utils.dummy
            }), utils.polyfillObjectKeys(), tester = testerFactory(requester, {
                collectAfterComplete: !1,
                duration: {
                    min: 5,
                    max: 30
                },
                connections: {
                    min: 1,
                    max: 8
                },
                maxAttempts: 10,
                aggregator: aggregator,
                measureLatency: !0,
                getTestOcasParams: {
                    https: !0,
                    endpoint: apiEndpoint,
                    token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
                    urlCount: 5
                },
                stopper: stopper,
                progressFrequencyMs: 150
            }), logger = logging(tester, {
                url: loggingEndpoint
            });
            var testLogger = logger.getLogger();
            if (testLogger.logEvent("PageVisit"), flushLogger(!0), setInterval(flushLogger, 2e3), window.location.pathname.indexOf("/share/") >= 0) {
                var l = testLogger,
                    data = {
                        referrer: document.referrer,
                        url: window.location.href
                    };
                l.logEvent("ShareLinkClicked", data), flushLogger(!0), setTimeout(function () {
                    window.location.href = location.protocol + "//" + location.hostname
                }, 5)
            }
            ui = require("./ui")(tester, testLogger), tester.on(events.START, function () {
                tester.on(events.END, ui.onComplete).on(events.PROGRESS, ui.onProgress)
            }).on(events.END, function () {
                tester.off(events.PROGRESS, ui.onProgress).off(events.END, ui.onComplete)
            }), logger.startLogging(), ui.setupEvents(), startTest(), require("./viewport-units-buggyfill").init()
        }), require("/app/browser_test.js")
}();