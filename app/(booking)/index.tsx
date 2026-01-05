import { useAuth } from '@/contexts/auth-context';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SERVICE_DATA = {
    "air-cooler": {
        "types": ["Window Air Coolers", "Tower Air Coolers", "Personal Air Coolers", "Desert Air Coolers"],
        "services": ["Servicing", "Repair", "Grass Change", "Water Pump Change", "Motor Winding", "Leakage Repair"]
    },
    "refrigerator": {
        "types": ["Single & Double Door Fridge", "Top & Bottom Fridge", "Side by Side Fridge", "French Door Fridge"],
        "services": ["Repair", "Service", "Gas Filling", "Compressor Replacement"]
    },
    "washing-machine": {
        "types": ["Front Load Washer", "Top Load Washer", "Semi-automatic", "Combo Washer dryer"],
        "services": ["Repair", "Service & Descaling", "Installation & Demo", "Drum Cleaning"]
    },
    "led-tv": {
        "types": ["LED", "QLED", "OLED", "LCD"],
        "services": ["Repair", "Installation", "Un-Installation", "Audio System Repair"]
    },
    "geyser": {
        "types": ["Electric Geyser", "Gas Geyser", "Solar Geysers", "Hybrid Geysers"],
        "services": ["Servicing", "Installation", "Un-Installation", "Thermostat Replacement"]
    },
    "fan": {
        "types": ["Ceiling Fan", "Wallmount Fan", "Table Fan/Desk Fan", "Pedestal Fan", "Exhaust Fan", "Tower Fan"],
        "services": ["Servicing", "Repair", "Installation", "Un-Installation", "Motor winding", "Noise Reduction"]
    },
    "mobile-phone": {
        "types": ["Android Phone", "Tablet (Android)", "iPhone (iOS)", "iPad (iPad OS)"],
        "services": ["Password Recovery", "Data Recovery", "Lock Screen Issues", "Screen Repair", "Battery Service", "Charging Port Repair"]
    },
    "laptop": {
        "types": ["Window OS Laptop", "Linux OS Laptop", "MacOS Laptop", "ChromeOS Laptop"],
        "services": ["OS Updates", "Disk Cleanup", "Driver Updates", "RAM Upgradation", "USB Port Repair", "Mother Board Repair"]
    },
    "computer": {
        "types": ["Desktop (Window) Computer", "Laptop (Window) Computer", "Desktop (Mac OS) Computer", "Laptop (Mac OS) Computer"],
        "services": ["OS Updates", "Disk Cleanup", "Driver Updates", "RAM Upgradation", "USB Port Repair", "Mother Board Repair"]
    },
    "cctv-camera-installation-service": {
        "types": ["360-Degree Camera", "Day/Night Camera", "Dome Camera", "PTZ Pan Tilt & Zoom Camera", "Bullet Camera", "C-Mount Camera"],
        "services": ["Video Playback issue", "Passwrod Recovery", "DVR/NVR Updates", "Camera Repair", "Cable & connector Repair", "Power Supply Repair"]
    },
    "ac": {
        "types": ["Window AC", "Split AC", "Floor Standing AC", "Cassette AC"],
        "services": ["Repair", "Normal Service", "Jet Service", "Installation", "Un-Installation", "Gas Filling"]
    },
    "plumber": {
        "types": ["Residential Plumber", "Commercial Plumber", "Service and Repair Plumber", "Sanitary Plumber"],
        "services": ["Pipe Leak Repair", "Clogged Drain Cleaning", "Toilet Repairs", "Gas Line Repair", "Garbage Disposal Reapir", "Water Pressure issues"]
    },
    "electrician": {
        "types": ["Residential Electrician", "Commercial Electrician", "Industrial Electrician", "Maintenance Electrician"],
        "services": ["Outlet & Switch Repair", "Elecrical Wiring Repair", "Lighting Fixture Repair", "Electrical Safety Inspections", "Electrical Outlet Upgrades", "Electrical Panel Upgrades"]
    },
    "carpenter": {
        "types": ["Trim Carpenter", "Cabinet Maker Carpenter", "Joister Carpenter", "Framer carpenter", "Roofer Carpenter", "Rough Carpenter"],
        "services": ["Furniture Making", "Door & Window Installation", "Flooring Installation", "Building Maintenance", "Framing", "Trim Work"]
    },
    "ro-water-purifier": {
        "types": ["Wall mounted RO water purifier", "Sink RO water purifier", "RO+UV+UF water purifier", "Gravity-based water purifiers", "Sediment filter water purifier", "Activated carbon water purifier"],
        "services": ["Water Leakage", "Installation + Un-Installation", "RO Membrane", "Low water pressure", "pH Imbalance", "Overheating"]
    }
};

export default function BookingScreen() {
    const { slug, serviceName, city } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const data = SERVICE_DATA[slug as keyof typeof SERVICE_DATA];
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        // Check authentication on mount
        if (!isAuthenticated) {
            Alert.alert(
                'Login Required',
                'Please login to book a service',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => router.back(),
                    },
                    {
                        text: 'Login',
                        onPress: () => {
                            router.push('/(auth)/login');
                        },
                    },
                ]
            );
        }
    }, [isAuthenticated]);

    if (!data) {
        return <Text>Service not found</Text>;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>

                <Text style={styles.heading}>
                    {serviceName} in {city ? city[0].toLocaleUpperCase() + city.slice(1) : ''}
                </Text>
            </View>

            <Section title={`Type of ${serviceName}`} items={data.types} />
            <Section title="Services Provided" items={data.services} />

            <Text style={styles.notice}>
                <Text style={{ fontWeight: '700' }}>
                    The Visit & Diagnosis charge is Rs 100.
                </Text>
                {' '}That is applicable only if the service is denied by the customer after the serviceman's visit to the service location.
            </Text>

            <Text style={styles.help}>Need help? Call us +91 8273737872</Text>

            <TouchableOpacity style={styles.bookBtn}>
                <Text style={styles.bookText}>Book Now</Text>
            </TouchableOpacity>
        </View>
    );
}

function Section({ title, items }: { title: string; items: string[] }) {
    return (
        <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>{title}</Text>

            <View style={styles.grid}>
                {items.map((item) => (
                    <View key={item} style={styles.option}>
                        <Text style={styles.optionText}>{item}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backBtn: {
        padding: 6,
        marginRight: 10,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: BrandColors.text,
    },
    notice: {
        marginTop: 20,
        textAlign: 'left',
        color: BrandColors.mutedText
    },
    help: {
        marginTop: 10,
        textAlign: 'left',
        fontWeight: '600'
    },
    bookBtn: {
        marginTop: 20,
        backgroundColor: BrandColors.primary,
        padding: 14,
        borderRadius: 30,
        alignItems: 'center',
    },
    bookText: {
        color: '#fff',
        fontWeight: '700'
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 10,
    },
    option: {
        width: '48%',
        backgroundColor: BrandColors.primary,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 12,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
        textAlign: 'center',
    },
});
