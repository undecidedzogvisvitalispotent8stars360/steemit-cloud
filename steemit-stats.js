var steem = require('steem');
const account = 'egmracer01';

// steem.api.getAccounts([account], function(err, result) {
//     // console.log(err, result);
//     const profile = result[0];
//     // console.log(`Hi my name is ${profile.name} and I joined Steemit on ${profile.created}`);
// });

let allResults = [];

const getHistoryRecursive = (skip) => {
    steem.api.getAccountHistory(account, skip, 100, function(err, result) {
        console.log(skip, err, (result || []).length);
        if (!result || result.length < 100) {
            if (result) {
                allResults = allResults.concat(result);
            }
            extractDataFromBlocks(allResults);
        } else {
            allResults = allResults.concat(result);
            getHistoryRecursive(allResults.length);
        }
    });
};

getHistoryRecursive(-1);

/**
 * getAccountHistory
 * returns:
 * Block[]
 *
 * Block: (number, BlockInfo)
 * BlockInfo: { block: number, op: Operation }
 * Operation: ( typeOfOperation: string, opInfo: OperationInfo )
 * OperationInfo: { body: string, title: string, json_metadata: stringified_json }
 */

const extractDataFromBlocks = (blocks) => {
    const permlinkSet = new Set();
    const allCommentBodies = [];

    blocks.forEach((block) => {
        const [blockNumber, blockInfo] = block;
        const {op} = blockInfo;
        const [typeOfOperation, opInfo] = op;
        if (typeOfOperation === 'comment' && opInfo['author'] === account) {
            if (!permlinkSet.has(opInfo.permlink)) {
                permlinkSet.add(opInfo.permlink);
                allCommentBodies.push(opInfo.body);
            }
        }
    });

    const wordAndCount = extractWordAndCounts(allCommentBodies.join(' '));
    const words = Object.keys(wordAndCount);
    words.sort((word1, word2) => wordAndCount[word2] - wordAndCount[word1]);
    const listToPrint = [];
    let normalizingFactor = null;
    words.forEach((word, index) => {
        if (stopList.indexOf(word) !== -1) {
            return;
        }
        if (!normalizingFactor) {
            normalizingFactor = 14 / wordAndCount[word];
        }

        if (listToPrint.length < 100) {
            listToPrint.push([word, Math.max(1, normalizingFactor * wordAndCount[word])]);
        }
    });
    console.log(listToPrint);
};



const extractWordAndCounts = (text) => {
    const wordAndCount = { };
    const words = text.split(/[ ,.\n]+/);
    words.forEach((word) => {
        const normalizedWord = word.toLowerCase();
        if ((/\W/g).test(normalizedWord)) {
            return;
        }
        if (wordAndCount[normalizedWord]) {
            wordAndCount[normalizedWord]++;
        } else {
            wordAndCount[normalizedWord] = 1;
        }
    });

    return wordAndCount;
}

const stopList = `
    1
    2
    3
    4
    5
    6
    7
    8
    9
    0
    january
    february
    march
    april
    may
    june
    july
    august
    september
    october
    november
    december
    monday
    tuesday
    wednesday
    thursday
    friday
    saturday
    a
    b
    c
    d
    e
    f
    g
    h
    i
    j
    k
    l
    m
    n
    o
    p
    q
    r
    s
    t
    u
    v
    w
    x
    y
    z
    -
    --
    ''
    we've
    we'll
    we're
    who'll
    who've
    who's
    you'll
    you've
    you're
    i'll
    i've
    i'm
    i'd
    he'll
    he'd
    he's
    she'll
    she'd
    she's
    it'll
    it'd
    it's
    they've
    they're
    they'll
    didn't
    don't
    can't
    won't
    isn't
    wasn't
    couldn't
    should't
    wouldn't
    ve
    ll
    re
    th
    rd
    st
    doing
    allow
    examining
    using
    during
    within
    across
    among
    whether
    especially
    without
    actually
    another
    am
    because
    cannot
    the
    of
    to
    and
    a
    in
    is
    it
    you
    that
    he
    was
    for
    on
    are
    with
    as
    I
    his
    they
    be
    at
    one
    have
    this
    from
    or
    had
    by
    hot
    word
    but
    what
    some
    we
    yet
    can
    out
    other
    were
    all
    there
    when
    up
    use
    your
    how
    said
    an
    each
    she
    which
    do
    their
    time
    if
    will
    shall
    way
    about
    many
    then
    them
    would
    like
    so
    these
    her
    long
    make
    thing
    see
    him
    two
    has
    look
    more
    day
    could
    go
    come
    did
    no
    yes
    most
    my
    over
    know
    than
    call
    first
    who
    may
    down
    side
    been
    now
    find
    any
    new
    part
    take
    get
    place
    made
    where
    after
    back
    little
    only
    came
    show
    every
    good
    me
    our
    under
    upon
    very
    through
    just
    great
    say
    low
    cause
    much
    mean
    before
    move
    right
    too
    same
    tell
    does
    set
    three
    want
    well
    also
    put
    here
    must
    big
    high
    such
    why
    ask
    men
    went
    kind
    need
    try
    again
    near
    should
    still
    between
    never
    last
    let
    though
    might
    saw
    left
    late
    run
    don't
    while
    close
    few
    seem
    next
    got
    always
    those
    both
    often
    thus
    won't
    not
    into
    inside
    its
    makes
    tenth
    trying
    i
    me
    my
    myself
    we
    us
    our
    ours
    ourselves
    you
    your
    yours
    yourself
    yourselves
    he
    him
    his
    himself
    she
    her
    hers
    herself
    it
    its
    itself
    they
    them
    their
    theirs
    themselves
    what
    which
    who
    whom
    this
    that
    these
    those
    am
    is
    are
    was
    were
    be
    been
    being
    have
    has
    had
    having
    do
    does
    did
    doing
    will
    would
    shall
    should
    can
    could
    may
    might
    must
    ought
    i'm
    you're
    he's
    she's
    it's
    we're
    they're
    i've
    you've
    we've
    they've
    i'd
    you'd
    he'd
    she'd
    we'd
    they'd
    i'll
    you'll
    he'll
    she'll
    we'll
    they'll
    isn't
    aren't
    wasn't
    weren't
    hasn't
    haven't
    hadn't
    doesn't
    don't
    didn't
    won't
    wouldn't
    shan't
    shouldn't
    can't
    cannot
    couldn't
    mustn't
    let's
    that's
    who's
    what's
    here's
    there's
    when's
    where's
    why's
    how's
    daren't
    needn't
    oughtn't
    mightn't
    a
    an
    the
    and
    but
    if
    or
    because
    as
    until
    while
    of
    at
    by
    for
    with
    about
    against
    between
    into
    through
    during
    before
    after
    above
    below
    to
    from
    up
    down
    in
    out
    on
    off
    over
    under
    again
    further
    then
    once
    here
    there
    when
    where
    why
    how
    all
    any
    both
    each
    few
    more
    most
    other
    some
    such
    no
    nor
    not
    only
    own
    same
    so
    than
    too
    very
    one
    every
    least
    less
    many
    now
    ever
    never
    say
    says
    said
    also
    get
    go
    goes
    just
    made
    make
    put
    see
    seen
    whether
    like
    well
    back
    even
    still
    way
    take
    since
    another
    however
    two
    three
    four
    five
    first
    second
    new
    old
    high
    long`.split(/[ ,.\n]+/);