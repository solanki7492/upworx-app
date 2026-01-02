import { BrandColors } from '@/theme/colors';
import { useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type OfferStackProps = {
    onChange?: (offer: any) => void;
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 170;

const offers = [
    { id: '1', title: 'AC Repair', subtitle: 'Flat 20% Off', image: require('@/assets/images/handyman.png') },
    { id: '2', title: 'Washing Machine', subtitle: 'Free Inspection', image: require('@/assets/images/handyman.png') },
    { id: '3', title: 'Electrician', subtitle: 'Starting at ₹299', image: require('@/assets/images/handyman.png') },
];

export function OfferStack({ onChange }: OfferStackProps) {
    const [index, setIndex] = useState(0);
    const pan = useRef(new Animated.ValueXY()).current;
    const fade = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderStart: () => {
                onChange && onChange(true);
            },
            onPanResponderEnd(e, gestureState) {
                onChange && onChange(false);
            },
            onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
            onPanResponderRelease: (_, g) => {
                if (Math.abs(g.dx) > 120) {
                    Animated.parallel([
                        Animated.timing(pan, {
                            toValue: { x: g.dx > 0 ? width : -width, y: 0 },
                            duration: 220,
                            useNativeDriver: false,
                        }),
                        Animated.timing(fade, {
                            toValue: 0,
                            duration: 180,
                            useNativeDriver: false,
                        }),
                    ]).start(() => {
                        pan.setValue({ x: 0, y: 0 });
                        fade.setValue(1);
                        scale.setValue(0.94);

                        setIndex((prev) => (prev + 1) % offers.length);

                        Animated.spring(scale, {
                            toValue: 1,
                            friction: 6,
                            useNativeDriver: false,
                        }).start();
                    });
                } else {
                    Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
                }
            }
        })
    ).current;

    const current = offers[index];

    return (
        <View style={styles.container}>
            {/* Smaller faded layers */}
            <View style={[styles.layer, styles.layer3]} />
            <View style={[styles.layer, styles.layer2]} />

            {/* Main card */}
            <Animated.View
                style={[
                    styles.card,
                    {
                        opacity: fade,
                        transform: [...pan.getTranslateTransform(), { scale }],
                    },
                ]}
                {...panResponder.panHandlers}
            >
                <Image source={current.image} style={styles.image} />
                <View style={styles.content}>
                    <Text style={styles.title}>{current.title}</Text>
                    <Text style={styles.subtitle}>{current.subtitle}</Text>
                    <TouchableOpacity style={styles.availButton}>
                        <Text style={styles.availNow}>Book Now</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: CARD_HEIGHT + 24,
    },

    layer: {
        position: 'absolute',
        alignSelf: 'center',
        height: CARD_HEIGHT,
        borderRadius: 22,
        backgroundColor: BrandColors.primary,
    },

    layer2: {
        width: CARD_WIDTH - 16,
        opacity: 0.35,
        top: 10,
    },

    layer3: {
        width: CARD_WIDTH - 32,
        opacity: 0.2,
        top: 18,
    },

    card: {
        position: 'absolute',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 21,
        backgroundColor: BrandColors.primary,
        alignSelf: 'center',
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 10,
    },

    image: {
        width: 120,
        height: 200,
        marginTop: 5,
        marginLeft: 10,
    },

    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },

    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },

    subtitle: {
        color: '#E0F2FE',
        marginTop: 4,
    },

    availButton: {
        marginTop: 12,
        backgroundColor: BrandColors.background,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 25,
        alignSelf: 'flex-start',
    },

    availNow: {
        padding: 4,
        color: BrandColors.primary,
        fontSize: 10,
        fontWeight: 'bold',
    },
});

