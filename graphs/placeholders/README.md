# Placeholders

The idea of placeholder queries is taken from [this](http://svn.aksw.org/papers/2011/VLDB_AKSWBenchmark/public.pdf)
paper. A placeholder query has a special value in the form of `%% v %%`, which 
is substituted with an actual value before querying. The actual values this
special placeholder can take are queried before hand, and a list is then iterated
which produces a number of different queries from one simple placeholder query.

Motivation for this from the paper:

> This method ensures, that (a) the actually executed queries during the 
> benchmarking differ, but (b) always
> return results. This change imposed on the original query
> avoids the effect of simple caching.

We will still need to write code which generates these queries, as the existing
placeholder queries can't run in their current format.

We will also not be storing the results to these queries as they will likely 
return too many results, and the results themselves will be difficult to parse
as the file will contain results which relate to many different atomic queries.