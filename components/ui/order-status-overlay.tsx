import { View, StyleSheet, Dimensions, Text } from 'react-native';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export default function OrderStatusOverlay({ status, orderId }: { status: 'loading' | 'success' | null, orderId?: string }) {
  if (!status) return null;

  return (
    <View style={styles.overlay}>
        {status === 'loading' && (
          <LottieView
            source={require('../../assets/animations/loading.json')}
            autoPlay
            loop
            style={styles.anim}
          />
        )}

        {status === 'success' && (
            <>
                <LottieView
                    source={require('../../assets/animations/success.json')}
                    autoPlay
                    loop={false}
                    style={styles.anim}
                />
                <Text style={styles.successText}>Order Confirmed</Text>
                <Text style={styles.orderId}>Order ID: {orderId}</Text>
            </>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  anim: {
    width: 220,
    height: 220,
  },
  successText: {
    color: '#333',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 20,
  },
  orderId: {
    color: '#666',
    fontSize: 14,
    marginTop: 6,
  },
});