import {useEffect} from 'react'
import Router from 'next/router'
import useSWR from 'swr'
import {User} from '@/types/api/user'

export default function useUser({
                                    redirectTo = '',
                                    redirectIfFound = false,
                                } = {}) {
    const fetcher = (url: string) => fetch(url).then(r => r.json());
    const swrResponse = useSWR<User>('/api/user', fetcher);
    const user = swrResponse.data

    useEffect(() => {
        // if no redirect needed, just return (example: already on /dashboard)
        // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
        if (!redirectTo || swrResponse.isValidating) return

        if (
            // If redirectTo is set, redirect if the user was not found.
            (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
            // If redirectIfFound is also set, redirect if the user was found
            (redirectIfFound && user?.isLoggedIn)
        ) {
            Router.push(redirectTo)
        }
    }, [user, swrResponse.isValidating, redirectIfFound, redirectTo])

    return {
        user: user,
        mutateUser: swrResponse.mutate,
        isValidatingUser: swrResponse.isValidating,
    }
}
