exports.getList = (req, res) => {
    console.log('Controller getList is called');
    const { moduleName, viewName, filters, search, page, perPage, orderType, orderBy } = req.query;

    res.json({
        message: "Data fetched successfully",
        data: {
            items: [{ id: 1, name: "Company A" }, { id: 2, name: "Company B" }]
        },
        params: req.query
                
    });
};
