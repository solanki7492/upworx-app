import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

export function SkeletonCapsule() {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[styles.skeleton, { opacity }]} />
    );
}

const styles = StyleSheet.create({
    skeleton: {
        width: 100,
        height: 40,
        backgroundColor: '#E5E7EB',
        borderRadius: 30,
        marginRight: 10,
    }
});
