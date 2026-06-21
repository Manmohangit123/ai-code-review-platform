const STORAGE_KEY = 'ai_review_history'

export const saveReview = (type, repo, file, score, severity) => {
    const history = getHistory()
    history.unshift({
        id: Date.now(),
        type,
        repo,
        file,
        score,
        severity,
        date: new Date().toISOString()
    })
    // Keep last 100 entries
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)))
}

export const getHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
        return []
    }
}

export const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
}

export const getStats = () => {
    const history = getHistory()
    if (history.length === 0) return null

    const scored = history.filter(h => h.score != null)
    const avgScore = scored.length
        ? Math.round(scored.reduce((sum, h) => sum + h.score, 0) / scored.length)
        : 0

    const byType = { review: 0, security: 0, performance: 0 }
    history.forEach(h => { if (byType[h.type] !== undefined) byType[h.type]++ })

    const byRepo = {}
    history.forEach(h => {
        byRepo[h.repo] = (byRepo[h.repo] || 0) + 1
    })
    const topRepos = Object.entries(byRepo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([repo, count]) => ({ repo, count }))

    // Last 10 scores for trend
    const trend = scored.slice(0, 10).reverse().map((h, i) => ({
        index: i + 1,
        score: h.score,
        file: h.file?.split('/').pop() || 'file',
        date: new Date(h.date).toLocaleDateString()
    }))

    return { total: history.length, avgScore, byType, topRepos, trend, history }
}
