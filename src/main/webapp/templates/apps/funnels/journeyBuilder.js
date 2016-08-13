'use strict';

var JBApp = {
    funnel: null,
    initialized: false,
    availableTriggers: null,
    ACTIONS: {
        'emailAction': '<i class="fa fa-envelope" aria-hidden="true"></i> <span class="node-type">Send Email</span>',
        'createTaskAction': '<i class="fa fa-tasks" aria-hidden="true"></i> <span class="node-type">Create Task</span>',
        'createDataSeriesAction': '<i class="fa fa-database" aria-hidden="true"></i> <span class="node-type">Create Data Series</span>',
        'calendarEventAction': '<i class="fa fa-calendar-check-o" aria-hidden="true"></i> <span class="node-type">Calendar Event</span>',
        'setField': '<i class="fa fa-pencil-square-o" aria-hidden="true"></i> <span class="node-type">Set Field</span>',
        'addToGroup': '<i class="fa fa-pencil-square-o" aria-hidden="true"></i> <span class="node-type">Add to group</span>',
        'removeProfile': '<i class="fa fa-pencil-square-o" aria-hidden="true"></i> <span class="node-type">Remove profile</span>'


    },
    GOALS: {
        'automationGoal': 'Automation Goal',
        'contactFormGoal': 'Contact Form Goal',
        'eventGoal': 'Event Goal',
        'pageViewGoal': 'Page View Goal',
        'taskCompleteGoal': 'Task Complete Goal',
        'emailResultGoal': 'Email Result Goal',
        'timerGoal': 'Timer Goal'
    },
    PORTS: {
        'automationGoal': {
            nextNodeId: 'When completed',
            timeoutNode: 'When timeout'
        },
        'contactFormGoal': {
            nextNodeId: 'When completed',
            timeoutNode: 'When timeout'
        },
        'eventGoal': {
            nextNodeId: 'When completed',
            timeoutNode: 'When timeout'
        },
        'pageViewGoal': {
            nextNodeId: 'When completed',
            timeoutNode: 'When timeout'
        },
        'taskCompleteGoal': {
            nextNodeId: 'When completed',
            timeoutNode: 'When timeout'
        },
        'emailResultGoal': {
            nodeIdDelivered: 'When delivered',
            nodeIdFailed: 'When failed',
            nodeIdOpened: 'When opened',
            nodeIdConverted: 'When converted',
            timeoutNode: 'When timeout'
        },
        'timerGoal': {
            timeoutNode: 'When timeout'
        }
    }
};

function initJourneyBuilder() {
    flog('initJourneyBuilder');

    initSideBar();
    initSaveButton();
    initNodeActions();
    initSettingPanel();
    initBuilderHeightAdjuster();
}

function getNodeData(node) {
    for (var key in node) {
        if (node.hasOwnProperty(key)) {
            return [key, node[key]];
        }
    }
}

function reloadFunnelJson() {
    flog('reloadFunnelJson');

    $('#funnelJson').reloadFragment({
        whenComplete: function () {
            parseFunnel();
        }
    });
}

function parseFunnel() {
    flog('parseFunnel');

    try {
        JBApp.funnel = $.parseJSON($('#funnelJson').text());
    } catch (e) {
        flog('no funnel found');
        JBApp.funnel = {
            nodes: []
        };
    }
}

jsPlumb.ready(function () {
    parseFunnel();
    JBApp.availableTriggers = $.parseJSON($('#triggers').text());
    
    // setup some defaults for jsPlumb.
    var instance = jsPlumb.getInstance({
        Endpoint: ['Dot', {
            radius: 2
        }],
        Connector: ['Flowchart', {
            cornerRadius: 5,
            gap: 1,
            stub: 15,
            alwaysRespectStubs: true,
            midpoint: 1
        }],
        HoverPaintStyle: {
            strokeStyle: '#1e8151',
            lineWidth: 2
        },
        ConnectionOverlays: [
            ['Arrow', {
                location: 1,
                id: 'arrow',
                length: 10,
                width: 10,
                foldback: 0.5
            }],
            ['Label', {
                label: '',
                id: 'label',
                cssClass: 'aLabel'
            }],
            ['Custom', {
                create: function () {
                    return $('<div><a href="#" title="Click to delete connection" class="buttonX"><i class="fa fa-times-circle"></i></a></div>');
                },
                events: {
                    click: function (labelOverlay, e) {
                        flog('Click on label overlay', labelOverlay, labelOverlay.component);

                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();

                        labelOverlay.component.setParameter('clickedButtonX', true);

                        if (confirm('Are you sure you want to delete this connection?')) {
                            labelOverlay.component.setParameter('clickedButtonXCancelled', false);
                        } else {
                            labelOverlay.component.setParameter('clickedButtonXCancelled', true);
                        }
                    }
                },
                location: 0.7,
                id: 'buttonX',
                visible: false
            }]
        ],
        Container: 'paper'
    });
    
    instance.registerConnectionType('basic', {
        anchors: [[1, 0.775, 1, 0], ['LeftMiddle', 'TopCenter', 'BottomCenter']],
        connector: 'StateMachine'
    });
    instance.registerConnectionType('nodeIdDelivered', {
        anchors: [[1, 0.775, 1, 0], ['LeftMiddle', 'TopCenter', 'BottomCenter']],
        connector: 'StateMachine'
    });
    instance.registerConnectionType('nodeIdFailed', {
        anchors: [[1, 0.63, 1, 0], ['LeftMiddle', 'TopCenter', 'BottomCenter']],
        connector: 'StateMachine'
    });
    instance.registerConnectionType('nodeIdOpened', {
        anchors: [[1, 0.475, 1, 0], ['LeftMiddle', 'TopCenter', 'BottomCenter']],
        connector: 'StateMachine'
    });
    instance.registerConnectionType('nodeIdConverted', {
        anchors: [[1, 0.325, 1, 0], ['LeftMiddle', 'TopCenter', 'BottomCenter']],
        connector: 'StateMachine'
    });
    instance.registerConnectionType('decisionChoices', {
        anchors: [[1, 0.775, 1, 0], ['LeftMiddle', 'TopCenter', 'BottomCenter']],
        connector: 'StateMachine'
    });
    instance.registerConnectionType('decisionDefault', {
        anchors: [[1, 0.925, 1, 0], ['LeftMiddle', 'TopCenter', 'BottomCenter']],
        connector: 'StateMachine'
    });
    instance.registerConnectionType('timeout', {
        anchors: [[1, 0.925, 1, 0], ['LeftMiddle', 'TopCenter', 'BottomCenter']],
        connector: 'StateMachine'
    });
    
    window.jsp = instance;
    
    // bind a click listener to each connection; the connection is deleted. you could of course
    // just do this: jsPlumb.bind('click', jsPlumb.detach), but I wanted to make it clear what was
    // happening.
    instance.bind('click', function (c) {
        if (c) {
            if (c.getParameter('clickedButtonX') === true) {
                var clickedButtonXCancelled = c.getParameter('clickedButtonXCancelled');
                if (clickedButtonXCancelled === false) {
                    deleteConnection(c);
                    instance.detach(c);
                    saveFunnel('Connection is deleted!');

                    return false;
                }
            }
        }

        var sourceId = c.sourceId;
        var targetId = c.targetId;

        flog('click on jsplump', c, sourceId, targetId);

        if (c && sourceId && targetId) {
            flog('edit connection ', c);
            var nodes = JBApp.funnel.nodes;

            var filteredGoal = nodes.filter(function (item) {
                var type = getNodeData(item)[0];
                return type.indexOf('Goal') !== -1 && item[type].nodeId === sourceId;
            });

            var filteredDecision = nodes.filter(function (item) {
                return item.hasOwnProperty('decision') && item['decision'].nodeId === sourceId;
            });
            flog('filteredDecision', filteredDecision);

            var filteredTimeout = filteredGoal.filter(function (item) {
                return item['goal'].timeoutNode === targetId;
            });
            flog('filteredDecision', filteredDecision);

            if (filteredGoal.length > 0) {
                var node = filteredGoal[0]['goal'];
                if (filteredTimeout.length > 0) {
                    // timeout node
                    showTimeoutModal(node, sourceId, targetId);
                }
            } else if (filteredDecision.length > 0) {
                var node = filteredDecision[0]['decision'];
                var choice = node.choices[targetId];
                if (choice) {
                    showChoiceForm(choice, sourceId, targetId);
                }
            }
        } else {
            flog('clicked to non-connection ', c);
        }
    });
    
    instance.bind('mouseover', function (connection, originalEvent) {
        if (connection.getOverlay('buttonX')) {
            connection.getOverlay('buttonX').show();
        }
    });
    
    instance.bind('mouseout', function (connection, originalEvent) {
        if (connection.getOverlay('buttonX')) {
            connection.getOverlay('buttonX').hide();
        }
    });
    
    // bind a connection listener. note that the parameter passed to this function contains more than
    // just the new connection - see the documentation for a full list of what is included in 'info'.
    // this listener sets the connection's internal
    // id as the label overlay's text.
    instance.bind('connection', function (info) {
        // Validate connection, we just allow only one connection between 2 endpoint within a direction
        var conn = info.connection;
        var label = '';
        var currentType = '';
        var connectionName = '';
        var nextNodeIdPropName = 'nextNodeId';

        if (conn.hasType('basic')) {
            label = 'then';
            currentType = 'basic';
            connectionName = 'Then';

        } else if (conn.hasType('timeout')) {
            label = 'timeout';
            currentType = 'timeout';
            connectionName = 'Timeout';
            nextNodeIdPropName = 'timeoutNode';

        } else if (conn.hasType('decisionDefault')) {
            label = 'default';
            currentType = 'decisionDefault';
            connectionName = 'Decision Default';

        } else if (conn.hasType('decisionChoices')) {
            label = 'choice';

        } else if (conn.hasType('nodeIdDelivered')) {
            label = 'delivered';
            currentType = 'nodeIdDelivered';
            connectionName = 'Email Delivered';
            nextNodeIdPropName = 'nodeIdDelivered';

        } else if (conn.hasType('nodeIdFailed')) {
            label = 'failed';
            currentType = 'nodeIdFailed';
            connectionName = 'Email Failed';
            nextNodeIdPropName = 'nodeIdFailed';

        } else if (conn.hasType('nodeIdOpened')) {
            label = 'opened';
            currentType = 'nodeIdOpened';
            connectionName = 'Email Opened';
            nextNodeIdPropName = 'nodeIdOpened';

        } else if (conn.hasType('nodeIdConverted')) {
            label = 'converted';
            currentType = 'nodeIdConverted';
            connectionName = 'Email Converted';
            nextNodeIdPropName = 'nodeIdConverted';
        }

        if (currentType === 'decisionDefault') {
            var arr = instance.select({
                source: conn.sourceId,
                target: conn.targetId
            });

            if (arr.length > 1) {
                Msg.warning('Connection between these nodes exists');
                instance.detach(conn);
                return;
            }
        }

        if (currentType) {
            var existingConnections = 0;
            instance.select({
                source: conn.sourceId
            }).each(function (item) {
                if (item.endpoints.length !== 0) {
                    if (item.endpoints[0].connectionType === currentType && item.endpoints[0].connections && item.endpoints[0].connections.length !== 0) {
                        existingConnections++;
                    }
                    return;
                }
            });

            if (existingConnections > 1) {
                Msg.warning(connectionName + ' connection exists. Please delete it and add new one');
                instance.detach(conn);
                return;
            }
        }

        // Set label
        conn.getOverlay('label').setLabel(label);
        
        if (JBApp.initialized) {
            flog('new connection was made', info.connection);
            var nodes = JBApp.funnel.nodes;
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                for (var key in node) {
                    if (node[key].nodeId === conn.sourceId) {
                        if (node[key].hasOwnProperty('choices')) {
                            flog('started from a decision node');
                            if (conn.hasType('decisionDefault')) {
                                node[key].nextNodeId = conn.targetId;
                            } else if (conn.hasType('decisionChoices')) {
                                // decision choices
                                if (!node[key].choices) {
                                    node[key].choices = {};
                                }
                                node[key].choices[conn.targetId] = {constant: {}};
                            }
                        } else {
                            node[key][nextNodeIdPropName] = conn.targetId;
                        }
                        break;
                    }
                }
            }

            saveFunnel();
        }
    });
    
    //
    // initialise element as connection targets and source.
    //
    function initNode(el, type) {
        // initialise draggable elements.
        instance.draggable(el, {
            stop: function () {
                saveFunnel();
            },
            grid: [10, 10]
        });
        
        if (type.indexOf('Goal') !== -1) {
            instance.makeSource(el, {
                filter: '.ep-timeout',
                connectorStyle: {strokeStyle: '#e5910f', lineWidth: 2, outlineColor: 'transparent', outlineWidth: 4},
                connectionType: 'timeout',
                extract: {
                    'action': 'timeout-action'
                },
                maxConnections: -1
            });

            if (type === 'emailResultGoal') {
                instance.makeSource(el, {
                    filter: '.ep-basic[data-name=nodeIdDelivered]',
                    connectorStyle: {strokeStyle: '#e50051', lineWidth: 2, outlineColor: 'transparent', outlineWidth: 4},
                    connectionType: 'nodeIdDelivered',
                    extract: {
                        'action': 'basic-action'
                    },
                    maxConnections: -1
                });

                instance.makeSource(el, {
                    filter: '.ep-basic[data-name=nodeIdFailed]',
                    connectorStyle: {strokeStyle: '#e50051', lineWidth: 2, outlineColor: 'transparent', outlineWidth: 4},
                    connectionType: 'nodeIdFailed',
                    extract: {
                        'action': 'basic-action'
                    },
                    maxConnections: -1
                });

                instance.makeSource(el, {
                    filter: '.ep-basic[data-name=nodeIdOpened]',
                    connectorStyle: {strokeStyle: '#e50051', lineWidth: 2, outlineColor: 'transparent', outlineWidth: 4},
                    connectionType: 'nodeIdOpened',
                    extract: {
                        'action': 'basic-action'
                    },
                    maxConnections: -1
                });

                instance.makeSource(el, {
                    filter: '.ep-basic[data-name=nodeIdConverted]',
                    connectorStyle: {strokeStyle: '#e50051', lineWidth: 2, outlineColor: 'transparent', outlineWidth: 4},
                    connectionType: 'nodeIdConverted',
                    extract: {
                        'action': 'basic-action'
                    },
                    maxConnections: -1
                });
            } else {
                instance.makeSource(el, {
                    filter: '.ep-basic',
                    connectorStyle: {strokeStyle: '#e50051', lineWidth: 2, outlineColor: 'transparent', outlineWidth: 4},
                    connectionType: 'basic',
                    extract: {
                        'action': 'basic-action'
                    },
                    maxConnections: -1
                });
            }
        } else if (type === 'decision') {
            instance.makeSource(el, {
                filter: '.ep-red',
                connectorStyle: {strokeStyle: '#f00', lineWidth: 2, outlineColor: 'transparent', outlineWidth: 4},
                connectionType: 'decisionDefault',
                extract: {
                    'action': 'decisionDefault-action'
                },
                maxConnections: -1
            });
            
            instance.makeSource(el, {
                filter: '.ep-green',
                connectorStyle: {strokeStyle: '#008000', lineWidth: 2, outlineColor: 'transparent', outlineWidth: 4},
                connectionType: 'decisionChoices',
                extract: {
                    'action': 'decisionChoices-action'
                },
                maxConnections: -1
            });
        } else {
            instance.makeSource(el, {
                filter: '.ep-basic',
                connectorStyle: {strokeStyle: '#e50051', lineWidth: 2, outlineColor: 'transparent', outlineWidth: 4},
                connectionType: 'basic',
                extract: {
                    'action': 'basic-action'
                },
                maxConnections: -1
            });
        }

        instance.makeTarget(el, {
            dropOptions: {
                hoverClass: 'dragHover'
            },
            allowLoopback: false
        });
    }
    
    function newNode(node, type, action) {
        flog('newNode', node, type, action);

        var d = document.createElement('div');
        d.className = 'w ' + type;
        d.id = node.nodeId;
        d.setAttribute('data-type', type);

        var nodeName = node.title ? '<span class="node-title-inner">' + node.title + '</span>' : '<span class="node-title-inner text-muted">Enter title</span>';
        var nodeHtml = '';

        if (type.indexOf('Goal') !== -1) {
            var portsString = '';
            var portsData = JBApp.PORTS[type];
            for (var portName in portsData) {
                var portData = portsData[portName];

                if (portName === 'timeoutNode') {
                    portsString += '<span title="' + portData + '" class="ep ep-timeout" data-name="' + portName + '"></span>';
                } else {
                    portsString += '<span title="' + portData + '" class="ep ep-basic" data-name="' + portName + '"></span>';
                }
            }

            nodeHtml += '<div class="title">';
            nodeHtml += '   <i class="fa fa-trophy" aria-hidden="true"></i>';
            nodeHtml += '   <span class="node-type">' + JBApp.GOALS[type] + '</span>';
            nodeHtml += '   <span class="node-buttons clearfix">';
            nodeHtml += '       <span class="btnNodeDetails" title="Edit details"><i class="fa fa-fw fa-cog"></i></span>';
            nodeHtml += '       <span class="btnNodeDelete" title="Delete this node"><i class="fa fa-fw fa-trash"></i></span>';
            nodeHtml += '   </span>';
            nodeHtml += '</div>';
            nodeHtml += '<div class="inner">';
            nodeHtml += '   <span class="nodeTitle btnNodeEdit">' + nodeName + ' <i class="fa fa-pencil"></i></span>' + portsString;
            nodeHtml += '</div>';
        } else if (type === 'decision') {
            nodeHtml += '<div class="title">';
            nodeHtml += '   <i class="fa fa-question-circle" aria-hidden="true"></i>';
            nodeHtml += '   <span class="node-type">Decision</span>';
            nodeHtml += '   <span class="node-buttons clearfix">';
            nodeHtml += '       <span class="btnNodeDetails" title="Edit details"><i class="fa fa-fw fa-cog"></i></span>';
            nodeHtml += '       <span class="btnNodeDelete" title="Delete this node"><i class="fa fa-fw fa-trash"></i></span>';
            nodeHtml += '   </span>';
            nodeHtml += '</div>';
            nodeHtml += '<div class="inner">';
            nodeHtml += '   <span class="nodeTitle btnNodeEdit">' + nodeName + ' <i class="fa fa-pencil"></i></span>';
            nodeHtml += '   <span title="Make new choice" class="ep ep-green"></span> ';
            nodeHtml += '   <span title="Default next action" class="ep ep-red"></span>';
            nodeHtml += '</div>'
        } else {
            nodeHtml += '<div class="title">' + JBApp.ACTIONS[action];
            nodeHtml += '   <span class="node-buttons clearfix">';
            nodeHtml += '       <span class="btnNodeDetails" title="Edit details"><i class="fa fa-fw fa-cog"></i></span>';
            nodeHtml += '       <span class="btnNodeDelete" title="Delete this node"><i class="fa fa-fw fa-trash"></i></span>';
            nodeHtml += '   </span>';
            nodeHtml += '</div>';
            nodeHtml += '<div class="inner">';
            nodeHtml += '   <span class="nodeTitle btnNodeEdit">' + nodeName + ' <i class="fa fa-pencil"></i></span>';
            nodeHtml += '   <span title="When completed" class="ep ep-basic"></span>';
            nodeHtml += '</div>';
        }

        d.innerHTML = nodeHtml;
        d.style.left = node.x + 'px';
        d.style.top = node.y + 'px';
        instance.getContainer().appendChild(d);
        initNode(d, type);
        return d;
    }
    
    JBApp.newNode = newNode;
    JBApp.initNode = initNode;
    
    function initConnection(node) {
        flog('initConnection', node);

        var nextNodeId;
        if (node.hasOwnProperty('choices')) {
            if (node.nextNodeId) {
                instance.connect({
                    source: node.nodeId,
                    target: node.nextNodeId,
                    type: 'decisionDefault'
                });
            }
            
            if (node.choices) {
                for (var key in node.choices) {
                    instance.connect({
                        source: node.nodeId,
                        target: key,
                        type: 'decisionChoices'
                    });
                }
            }
        } else {
            if (node.nextNodeId) {
                instance.connect({
                    source: node.nodeId,
                    target: node.nextNodeId,
                    type: 'basic'
                });
            }

            if (node.timeoutNode) {
                instance.connect({
                    source: node.nodeId,
                    target: node.timeoutNode,
                    type: 'timeout'
                });
            }

            // Email Result Goal
            if (node.nodeIdDelivered) {
                instance.connect({
                    source: node.nodeId,
                    target: node.nodeIdDelivered,
                    type: 'nodeIdDelivered'
                });
            }
            if (node.nodeIdFailed) {
                instance.connect({
                    source: node.nodeId,
                    target: node.nodeIdFailed,
                    type: 'nodeIdFailed'
                });
            }
            if (node.nodeIdOpened) {
                instance.connect({
                    source: node.nodeId,
                    target: node.nodeIdOpened,
                    type: 'nodeIdOpened'
                });
            }
            if (node.nodeIdConverted) {
                instance.connect({
                    source: node.nodeId,
                    target: node.nodeIdConverted,
                    type: 'nodeIdConverted'
                });
            }
        }
    }
    
    // suspend drawing and initialise.
    instance.batch(function () {
        if (JBApp.funnel && JBApp.funnel.nodes && JBApp.funnel.nodes.length) {
            var journeyBuilder = $('#journeyBuilder');
            $('a[href=#journeyBuilder]').on('click', function () {
                if (!journeyBuilder.hasClass('initialized')) {
                    JBApp.initialized = false;
                    for (var i = 0; i < JBApp.funnel.nodes.length; i++) {
                        var node = JBApp.funnel.nodes[i];

                        for (var key in node) {
                            if (node.hasOwnProperty(key)) {
                                var nodeData = node[key];
                                var type = key;
                                if (key !== 'decision' && key.indexOf('Goal') === -1) {
                                    type = 'action';
                                }

                                newNode(nodeData, type, key);
                            }
                        }
                    }

                    for (var i = 0; i < JBApp.funnel.nodes.length; i++) {
                        var node = JBApp.funnel.nodes[i];

                        for (var key in node) {
                            if (node.hasOwnProperty(key)) {
                                var nodeData = node[key];
                                initConnection(nodeData);
                            }
                        }
                    }

                    JBApp.initialized = true;
                    journeyBuilder.addClass('initialized')
                }
            }).trigger('click');
        }
    });
    
    jsPlumb.fire('jsPlumbDemoLoaded', instance);
    JBApp.jsPlumpInstance = instance;
    JBApp.initialized = true;
    flog('JBApp init done');
});

function initSettingPanel() {
    flog('initSettingPanel');

    var settingPanel = $('.panel-setting');

    settingPanel.find('.btn-close-setting').on('click', function (e) {
        e.preventDefault();

        hideSettingPanel();
    });

    settingPanel.find('.btn-save-setting').on('click', function (e) {
        e.preventDefault();

        settingPanel.find('.panel-body form.active').trigger('submit');
    });

    initTitleForm();
    initChoiceForm();
    initTimeoutForm();
}

function initTitleForm() {
    flog('initTitleForm');

    var form = $('form.panel-edit-title');
    form.on('submit', function (e) {
        e.preventDefault();

        updateNode(form);
    });
}

function updateNode(form) {
    flog('updateNode', form);

    var sourceId = form.find('[name=sourceId]').val();
    var title = form.find('[name=title]').val();
    for (var i = 0; i < JBApp.funnel.nodes.length; i++) {
        var node = JBApp.funnel.nodes[i];
        for (var key in node) {
            if (node[key].nodeId === sourceId) {
                node[key].title = title;

                saveFunnel('Title is updated', function () {
                    var nodeTitleInner = $('#' + sourceId).find('.nodeTitle .node-title-inner');
                    if (nodeTitleInner.hasClass('text-muted')) {
                        nodeTitleInner.removeClass('text-muted')
                    }
                    nodeTitleInner.html(title);

                    hideSettingPanel();
                });

                break;
            }
        }
    }
}

function initBuilderHeightAdjuster() {
    flog('initBuilderHeightAdjuster');

    var builder = $('#builder');

    $('.btn-increase-height').on('click', function (e) {
        e.preventDefault();

        builder.css('height', (builder.height() + 50) + 'px');
    });

    $('.btn-decrease-height').on('click', function (e) {
        e.preventDefault();

        var currentHeight = builder.height();
        var newHeight = currentHeight - 50;

        builder.css('height', (newHeight <= 500 ? 500 : newHeight) + 'px');
    });
}

function hideSettingPanel() {
    flog('hideSettingPanel');

    var settingPanel = $('.panel-setting');
    settingPanel.attr('class', 'panel panel-default panel-setting');
    settingPanel.find('.panel-body .active').removeClass('active');
}

function showSettingPanel(formName) {
    flog('showSettingPanel', formName);

    var settingPanel = $('.panel-setting');
    var settingPanelBody = settingPanel.find('.panel-body');
    var formPanel = settingPanelBody.find('.panel-' + formName);
    settingPanel.attr('class', 'panel panel-default panel-setting showed panel-' + formName);
    settingPanelBody.find('.active').removeClass('active');
    formPanel.addClass('active');
    setTimeout(function () {
        formPanel.find('input:text').first().trigger('focus');
    }, 250);
}

function initSideBar() {
    flog('initSideBar');

    var rightPanel = $('.right-panel');

    rightPanel.find('.list-group, .panel-body').niceScroll({
        cursorcolor: '#999',
        cursorwidth: 6,
        railpadding: {
            top: 0,
            right: 0,
            left: 0,
            bottom: 0
        },
        cursorborder: '',
        disablemutationobserver: true
    });

    rightPanel.find('.list-group-item').draggable({
        revert: 'invalid',
        tolerance: 'pointer',
        helper: 'clone'
    });

    var paper = $('#paper');
    paper.droppable({
        drop: function (event, ui) {
            var type = ui.draggable.attr('data-type');
            var id = uuid();
            var node = {
                nodeId: type + '-' + id,
                x: ui.offset.left - paper.offset().left,
                y: ui.offset.top - paper.offset().top
            };
            
            var objToPush = {};
            var action;
            if (type === 'action') {
                action = ui.draggable.attr('data-action');
                objToPush[action] = node; // default task name
            }
            
            if (type !== 'action') {
                objToPush[type] = node;
            }
            JBApp.newNode(node, type, action);
            JBApp.funnel.nodes.push(objToPush);
            saveFunnel('New node is added!');
        }
    });
}

function showChoiceForm(choice, sourceId, targetId) {
    flog('showChoiceForm', choice, sourceId, targetId);

    var form = $('form.panel-decision');
    form.find('[name=sourceId]').val(sourceId);
    form.find('[name=targetId]').val(targetId);
    form.find('[name=constValue]').val(choice.constant.value || '');
    showSettingPanel('decision');
}

function showTimeoutModal(node, sourceId, targetId) {
    flog('showTimeoutModal', node, sourceId, targetId);

    var form = $('form.panel-timeout');
    form.find('[name=sourceId]').val(sourceId);
    form.find('[name=targetId]').val(targetId);
    form.find('[name=timeoutMins]').val(node.timeoutMins);

    showSettingPanel('timeout');
}

function initTimeoutForm() {
    flog('initTimeoutForm');

    var form = $('form.panel-timeout');
    form.on('submit', function (e) {
        e.preventDefault();
        
        doSaveTimeout(form);
    });
}

function doSaveTimeout(form) {
    flog('doSaveTimeout', form);

    var sourceId = form.find('[name=sourceId]').val();
    var targetId = form.find('[name=targetId]').val();
    var timeoutMins = form.find('[name=timeoutMins]').val();
    for (var i = 0; i < JBApp.funnel.nodes.length; i++) {
        var node = JBApp.funnel.nodes[i];
        for (var key in node) {
            if (node[key].nodeId === sourceId && node[key].hasOwnProperty('timeoutNode')) {
                if (node[key].timeoutNode === targetId) {
                    node[key].timeoutMins = timeoutMins;
                    break;
                }
            }
        }
    }

    saveFunnel('Timeout is updated', function () {
        hideSettingPanel();
    });
}

function initChoiceForm() {
    flog('initChoiceForm');

    var form = $('form.panel-decision');
    form.on('submit', function (e) {
        e.preventDefault();
        
        doSaveChoice(form);
    });
}

function doSaveChoice(form) {
    flog('doSaveChoice', form);

    var sourceId = form.find('[name=sourceId]').val();
    var targetId = form.find('[name=targetId]').val();
    var constValue = form.find('[name=constValue]').val();

    for (var i = 0; i < JBApp.funnel.nodes.length; i++) {
        var node = JBApp.funnel.nodes[i];
        for (var key in node) {
            if (node[key].nodeId === sourceId) {
                if (node[key].hasOwnProperty('choices')) {
                    var choices = node[key].choices;
                    if (!choices) {
                        choices = {};
                    }

                    if (targetId in choices) {
                        var constant = choices[targetId].constant || {
                                value: '',
                                label: 'empty'
                            };
                        constant.value = constValue;

                        choices[targetId].constant = constant;
                    }

                    node[key].choices = choices;
                    break;
                }
            }
        }
    }

    saveFunnel('Decision choices updated', function () {
        hideSettingPanel();
    });
}

function showTitleForm(node) {
    flog('showTitleForm', node);

    var title = node.title || '';
    var form = $('form.panel-edit-title');
    form.find('[name=title]').val(title);
    form.find('[name=sourceId]').val(node.nodeId);
    showSettingPanel('edit-title');
}

function initNodeActions() {
    flog('initNodeActions');

    $(document.body).on('click', '.btnNodeEdit', function (e) {
        e.preventDefault();

        var nodeId = $(this).closest('.w').attr('id');
        for (var i = 0; i < JBApp.funnel.nodes.length; i++) {
            var node = JBApp.funnel.nodes[i];
            for (var key in node) {
                if (node[key].nodeId === nodeId) {
                    showTitleForm(node[key]);
                    break;
                }
            }
        }
    });

    var formDetails = $('form.panel-edit-details');
    formDetails.forms({
        onSuccess: function () {
            reloadFunnelJson();
            hideSettingPanel();
        }
    });

    $(document.body).on('click', '.btnNodeDetails', function (e) {
        e.preventDefault();

        var domElement = $(this).closest('.w');
        var id = domElement.attr('id');
        var href = window.location.pathname;
        if (!href.endsWith('/')) {
            href += '/';
        }
        href = href + id + '?mode=settings';

        formDetails.load(href + ' #frmDetails > *', function () {
            formDetails.attr('action', href);

            showSettingPanel('edit-details');
        });
    });

    $(document.body).on('click', '.btnNodeDelete', function (e) {
        e.preventDefault();

        var domElement = $(this).closest('.w');
        if (confirm('Are you sure you want to delete this node?')) {
            var id = domElement.attr('id');
            deleteNode(id);
            JBApp.jsPlumpInstance.remove(id);
            saveFunnel('Node is deleted!');
        }
    });
}

function deleteNode(nodeId) {
    flog('deleteNode', nodeId);

    var index = -1;
    for (var i = 0; i < JBApp.funnel.nodes.length; i++) {
        var node = JBApp.funnel.nodes[i];
        for (var key in node) {
            if (node[key].nodeId === nodeId) {
                index = i;
                break;
            }
        }
    }
    
    if (index > -1) {
        JBApp.funnel.nodes.splice(index, 1);
    }
}

function deleteConnection(connection) {
    flog('deleteConnection', connection);

    for (var i = 0; i < JBApp.funnel.nodes.length; i++) {
        var node = JBApp.funnel.nodes[i];
        for (var key in node) {
            if (node[key].nodeId === connection.sourceId) {
                if (key.indexOf('Goal') !== -1) {
                    if (connection.hasType('timeout')) {
                        node[key].timeoutNode = '';
                    } else {
                        if (connection.hasType('nodeIdDelivered')) {
                            node[key].nodeIdDelivered = '';
                        }
                        if (connection.hasType('nodeIdFailed')) {
                            node[key].nodeIdFailed = '';
                        }
                        if (connection.hasType('nodeIdOpened')) {
                            node[key].nodeIdOpened = '';
                        }
                        if (connection.hasType('nodeIdConverted')) {
                            node[key].nodeIdConverted = '';
                        }
                    }
                } else if (key === 'decision') {
                    if (connection.hasType('decisionDefault')) {
                        node[key].nextNodeId = '';
                    } else if (connection.hasType('decisionChoices')) {
                        if (node[key].choices.hasOwnProperty(connection.targetId)) {
                            delete node[key].choices[connection.targetId];
                        }
                    }
                } else {
                    node[key].nextNodeId = '';
                }
                break;
            }
        }
    }
}

function initSaveButton() {
    flog('initSaveButton');

    $('#btnSave').on('click', function (e) {
        e.preventDefault();

        saveFunnel();
    });
}

function saveFunnel(message, callback) {
    flog('saveFunnel', message);

    var builderStatus = $('#builder-status');
    builderStatus.show().html('Saving...');

    for (var i = 0; i < JBApp.funnel.nodes.length; i++) {
        var node = JBApp.funnel.nodes[i];
        for (var key in node) {
            if (node.hasOwnProperty(key)) {
                var nodeId = node[key].nodeId;
                node[key].x = parseInt($('#' + nodeId).css('left').replace('px', ''));
                node[key].y = parseInt($('#' + nodeId).css('top').replace('px', ''));
            }
        }
    }

    $.ajax({
        url: 'funnel.json',
        type: 'PUT',
        data: JSON.stringify(JBApp.funnel),
        success: function () {
            builderStatus.html(message || 'Funnel is saved!').delay(2000).fadeOut(2000);

            if (typeof callback === 'function') {
                callback();
            }
        },
        error: function (e) {
            Msg.error(e.status + ': ' + e.statusText);
        }
    });
}

function uuid() {
    return ('xxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }));
}
