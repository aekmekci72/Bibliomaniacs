# sorry i'll write some of my thoughts here about what approach we should take
# if anybody has other ideas let's see what could be better!

#im thinking:
# stars -> target/weight
# sentiment score of review text -> feature
# review embedding -> feature

#represent the books like
# - genre features tokenized
# - review text embeddings
# - grade suitability

# and we represent users like
# user vector is the weighted average of books they liked based on past reviews
# e.g. star rating, sentiment score, recency(?) as weights
# also include preferred genres
# user grade