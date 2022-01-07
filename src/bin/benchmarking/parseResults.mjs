import * as dfd from 'danfojs-node'

const uniqueIndices = arr => {
    const indices = arr.map(value => arr.indexOf(value))
    const uniqueIndices = [...new Set(indices)]
    return uniqueIndices
}

const filterValue = value => {
    if (typeof value === 'string') {
        return !value.includes('type')
    }
    return true
}

const cleanName = string => {
    string = string.replace(/http:\/\/iguana-benchmark.eu\/.+\//g, '')
    string = string.replace(/http:\/\/www.w3.org\/.+#/g, '')
    return string
}

const toSeries = (df, col, val) => {
    const keep = uniqueIndices(df[col].values).filter(index =>
        filterValue(df[col].values[index])
    )

    const index = df[col].values
        .filter((_, index) => keep.includes(index))
        .map(cleanName)

    const values = df[val].values.filter((_, index) => keep.includes(index))

    return { index, values }
}

const organise = df => {
    const a = toSeries(df, 'gPredicate', 'gValue')
    const b = toSeries(df, 'cPredicate', 'cValue')
    const values = [...a.values, ...b.values]
    const index = [...a.index, ...b.index]
    return new dfd.DataFrame([values], { columns: index })
}

const main = async () => {
    const df = await dfd.read_csv(
        'src/benchmarking/results/sparql_2022-01-07_11-13-37Z.tsv'
    )
    const queryGroups = df.groupby(['query'])

    const uniqueQueries = df.column('query').unique()
    const rows = uniqueQueries.values.map(q =>
        organise(queryGroups.get_groups(q))
    )
    const concatenated = dfd.concat({ df_list: rows, axis: 0 })
    const averageTimeMs = concatenated['QPS'].map(v => 1000 / v)

    concatenated['QPS'] = concatenated['QPS'].map(Math.round)
    concatenated['penalizedQPS'] = concatenated['penalizedQPS'].map(Math.round)

    const columnsByUsefulness = [
        'ID',
        'averageTimeMs',
        'QPS',
        'penalizedQPS',
        'totalTime',
        'triples',
        'resultSize',
        'aggregations',
        'filter',
        'groupBy',
        'having',
        'offset',
        'optional',
        'orderBy',
        'union',
        'failed',
        'succeeded',
        'timeOuts',
        'unknownException',
        'wrongCodes',
    ]

    const result = concatenated
        .addColumn({
            column: 'averageTimeMs',
            values: averageTimeMs,
        })
        .drop({ columns: ['sameAs', 'label', 'queryID'] })
        .set_index({ column: 'ID' })
        .loc({ columns: columnsByUsefulness })
        .fillna(-1)
        .rename({ mapper: { totalTime: 'totalTimeMs' } })
        .astype({ column: 'averageTimeMs', dtype: 'int32' })
        .astype({ column: 'totalTimeMs', dtype: 'int32' })
        .sort_values({ by: 'averageTimeMs' })

    // save results as name of graph
    result.to_csv({
        filePath: 'src/benchmarking/parsedResults/2022-01-06_11-47.797.csv',
    })
}

main()
