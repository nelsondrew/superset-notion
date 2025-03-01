export function getDropProps({parentId , chartmeta , generatedId}) {
    const dropTemplate = {
        source: {
            id: "NEW_COMPONENTS_SOURCE_ID",
            type: "NEW_COMPONENT_SOURCE",
            index: 0
        },
        dragging: {
            id: "NEW_CHART_ID",
            type: "CHART",
            meta: {
                chartId: 120,
                sliceName: "Weekly Messages"
            }
        },
        position: "DROP_TOP",
        destination: {
            id: "HELLO-IJTYv767bAWa8Y400_h0S",
            type: "HELLO",
            index: 0
        },
        generatedId
    }

    dropTemplate.dragging.meta = chartmeta;
    dropTemplate.destination.id = parentId;
    return dropTemplate;
}