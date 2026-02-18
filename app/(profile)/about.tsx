import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AboutScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handleWebsite = () => {
        Linking.openURL('https://upworx.in');
    };

    const handleEmail = () => {
        Linking.openURL('mailto:info@upworx.in');
    };

    const handleSocialMedia = (platform: string) => {
        const urls: { [key: string]: string } = {
            facebook: 'https://facebook.com/upworx',
            twitter: 'https://twitter.com/upworx',
            instagram: 'https://instagram.com/upworx',
            linkedin: 'https://linkedin.com/company/upworx',
        };
        if (urls[platform]) {
            Linking.openURL(urls[platform]);
        }
    };

    const handlePrivacyPolicy = () => {
        Linking.openURL('https://upworx.in/privacy-policy');
    };

    const handleTermsOfService = () => {
        Linking.openURL('https://upworx.in/terms-conditions');
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="briefcase" size={64} color={BrandColors.primary} />
                    </View>
                    <Text style={styles.appName}>UpWorx</Text>
                    <Text style={styles.tagline}>Your trusted service partner</Text>
                    <Text style={styles.version}>Version 1.0.1</Text>
                </View>

                {/* About Content */}
                <View style={styles.aboutCard}>
                    <Text style={styles.aboutTitle}>About UpWorx</Text>
                    <Text style={styles.aboutText}>
                        UpWorx is your one-stop solution for all home and professional services. We connect you with
                        verified and skilled professionals to handle all your service needs, from home repairs to
                        professional consultations.
                    </Text>
                    <Text style={styles.aboutText}>
                        Our mission is to make quality services accessible to everyone, providing convenience,
                        reliability, and peace of mind.
                    </Text>
                </View>

                {/* Features */}
                <View style={styles.featuresCard}>
                    <Text style={styles.sectionTitle}>Why Choose Us</Text>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="shield-checkmark" size={24} color={BrandColors.primary} />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>Verified Professionals</Text>
                            <Text style={styles.featureText}>All our service providers are thoroughly verified</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="cash" size={24} color={BrandColors.primary} />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>Best Prices</Text>
                            <Text style={styles.featureText}>Competitive pricing with no hidden charges</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="time" size={24} color={BrandColors.primary} />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>On-Time Service</Text>
                            <Text style={styles.featureText}>Punctual and reliable service delivery</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="star" size={24} color={BrandColors.primary} />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>Quality Assured</Text>
                            <Text style={styles.featureText}>100% satisfaction guaranteed</Text>
                        </View>
                    </View>
                </View>

                {/* Contact Section */}
                <View style={styles.contactCard}>
                    <Text style={styles.sectionTitle}>Get in Touch</Text>

                    <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
                        <Ionicons name="globe-outline" size={20} color={BrandColors.text} />
                        <Text style={styles.contactText}>www.upworx.in</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                        <Ionicons name="mail-outline" size={20} color={BrandColors.text} />
                        <Text style={styles.contactText}>info@upworx.in</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactItem}>
                        <Ionicons name="call-outline" size={20} color={BrandColors.text} />
                        <Text style={styles.contactText}>+91 8273737872</Text>
                    </TouchableOpacity>
                </View>

                {/* Social Media */}
                <View style={styles.socialCard}>
                    <Text style={styles.sectionTitle}>Follow Us</Text>
                    <View style={styles.socialLinks}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleSocialMedia('facebook')}
                        >
                            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleSocialMedia('twitter')}
                        >
                            <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleSocialMedia('instagram')}
                        >
                            <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleSocialMedia('linkedin')}
                        >
                            <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Legal */}
                <View style={styles.legalCard}>
                    <TouchableOpacity style={styles.legalItem} onPress={handlePrivacyPolicy}>
                        <Text style={styles.legalText}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.legalItem} onPress={handleTermsOfService}>
                        <Text style={styles.legalText}>Terms of Service</Text>
                        <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                    </TouchableOpacity>

                    {/* <TouchableOpacity style={[styles.legalItem, styles.lastLegalItem]}>
                        <Text style={styles.legalText}>Licenses</Text>
                        <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                    </TouchableOpacity> */}
                </View>

                {/* Copyright */}
                <Text style={styles.copyright}>© 2026 UpWorx. All rights reserved.</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BrandColors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.text,
        flex: 1,
        textAlign: 'center',
    },
    content: {
        padding: 16,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: `${BrandColors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: BrandColors.mutedText,
        marginBottom: 8,
    },
    version: {
        fontSize: 14,
        color: BrandColors.mutedText,
    },
    aboutCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    aboutTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 12,
    },
    aboutText: {
        fontSize: 14,
        color: BrandColors.text,
        lineHeight: 22,
        marginBottom: 12,
    },
    featuresCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${BrandColors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.text,
        marginBottom: 4,
    },
    featureText: {
        fontSize: 14,
        color: BrandColors.mutedText,
    },
    contactCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    contactText: {
        fontSize: 16,
        color: BrandColors.text,
    },
    socialCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    socialLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: BrandColors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    legalCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    legalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.border,
    },
    lastLegalItem: {
        borderBottomWidth: 0,
    },
    legalText: {
        fontSize: 16,
        fontWeight: '500',
        color: BrandColors.text,
    },
    copyright: {
        fontSize: 12,
        color: BrandColors.mutedText,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
});
