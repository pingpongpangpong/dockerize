var user = {
    'name': undefined,
    'websocket': undefined,
}

var eventHandlers = {};

const addEventListener = (eventNode, eventName, eventHandler) => {
    if (!(eventName in eventHandlers)) {
        eventHandlers[eventName] = [];
    }
    
    eventHandlers[eventName].push({eventNode: eventNode, eventHandler: eventHandler});
    eventNode.addEventListener(eventName, eventHandler);
}

const removeAllListeners = (targetNode, eventName) => {
    eventHandlers[eventName]
    .filter(({eventNode}) => eventNode == targetNode)
    .forEach(({ eventNode, eventHandler }) => eventNode.removeEventListener(evnetName, eventHandler));

    eventHandlers[eventName] = eventHandlers[eventName].filter(
        ({eventNode}) => eventNode !== targetNode,
    )
}