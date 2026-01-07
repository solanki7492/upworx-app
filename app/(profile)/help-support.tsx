import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    expanded: boolean;
}

const mockFAQs: FAQItem[] = [
    {
        id: '1',
        question: 'How do I book a service?',
        answer: 'You can book a service by browsing the available services on the Services tab, selecting the service you need, and following the booking process. You can choose your preferred date and time.',
        expanded: false,
    },
    {
        id: '2',
        question: 'Can I cancel or reschedule my booking?',
        answer: 'Yes, you can cancel or reschedule your booking from the Orders tab. Please note that cancellation charges may apply depending on the time of cancellation.',
        expanded: false,
    },
    {
        id: '3',
        question: 'What payment methods do you accept?',
        answer: 'We accept various payment methods including credit/debit cards, UPI, net banking, and cash on delivery for select services.',
        expanded: false,
    },
    {
        id: '4',
        question: 'How can I track my order?',
        answer: 'You can track your order in real-time from the Orders tab. You will receive notifications about the status of your booking.',
        expanded: false,
    },
    {
        id: '5',
        question: 'Are the service professionals verified?',
        answer: 'Yes, all our service professionals are thoroughly verified and trained to provide quality service.',
        expanded: false,
    },
];

export default function HelpSupportScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [faqs, setFaqs] = useState<FAQItem[]>(mockFAQs);
    const [message, setMessage] = useState('');

    const toggleFAQ = (id: string) => {
        setFaqs((prev) =>
            prev.map((faq) => (faq.id === id ? { ...faq, expanded: !faq.expanded } : faq))
        );
    };

    const handleCall = () => {
        Linking.openURL('tel:+919876543210');
    };

    const handleEmail = () => {
        Linking.openURL('mailto:support@upworx.com');
    };

    const handleWhatsApp = () => {
        Linking.openURL('https://wa.me/919876543210');
    };

    const handleSubmit = () => {
        if (!message.trim()) {
            Alert.alert('Error', 'Please enter your message');
            return;
        }
        Alert.alert('Success', 'Your message has been sent. We will get back to you soon.');
        setMessage('');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Contact Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <View style={styles.contactGrid}>
                        <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
                            <View style={[styles.contactIcon, { backgroundColor: '#34C759' + '15' }]}>
                                <Ionicons name="call" size={24} color="#34C759" />
                            </View>
                            <Text style={styles.contactLabel}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
                            <View style={[styles.contactIcon, { backgroundColor: '#007AFF' + '15' }]}>
                                <Ionicons name="mail" size={24} color="#007AFF" />
                            </View>
                            <Text style={styles.contactLabel}>Email</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
                            <View style={[styles.contactIcon, { backgroundColor: '#25D366' + '15' }]}>
                                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                            </View>
                            <Text style={styles.contactLabel}>WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FAQs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    <View style={styles.faqContainer}>
                        {faqs.map((faq) => (
                            <TouchableOpacity
                                key={faq.id}
                                style={[styles.faqCard, faq.expanded && styles.faqCardExpanded]}
                                onPress={() => toggleFAQ(faq.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.faqHeader}>
                                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                                    <Ionicons
                                        name={faq.expanded ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color={BrandColors.primary}
                                    />
                                </View>
                                {faq.expanded && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Send Message */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Send us a Message</Text>
                    <View style={styles.messageCard}>
                        <TextInput
                            style={styles.messageInput}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Type your message here..."
                            placeholderTextColor={BrandColors.mutedText}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSubmit}>
                            <Text style={styles.sendButtonText}>Send Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Support Hours */}
                <View style={[styles.section, styles.lastSection]}>
                    <View style={styles.supportHoursCard}>
                        <Ionicons name="time-outline" size={24} color={BrandColors.primary} />
                        <View style={styles.supportHoursText}>
                            <Text style={styles.supportHoursTitle}>Support Hours</Text>
                            <Text style={styles.supportHoursSubtitle}>Monday - Sunday: 9:00 AM - 9:00 PM</Text>
                        </View>
                    </View>
                </View>
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
    section: {
        padding: 16,
    },
    lastSection: {
        paddingBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 12,
    },
    contactGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    contactCard: {
        flex: 1,
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    contactIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    contactLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
    },
    faqContainer: {
        gap: 12,
    },
    faqCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    faqCardExpanded: {
        borderLeftWidth: 3,
        borderLeftColor: BrandColors.primary,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.text,
        flex: 1,
    },
    faqAnswer: {
        fontSize: 14,
        color: BrandColors.mutedText,
        lineHeight: 20,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: BrandColors.border,
    },
    messageCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    messageInput: {
        fontSize: 16,
        color: BrandColors.text,
        minHeight: 120,
        marginBottom: 16,
        padding: 12,
        backgroundColor: BrandColors.background,
        borderRadius: 8,
    },
    sendButton: {
        backgroundColor: BrandColors.primary,
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    sendButtonText: {
        color: BrandColors.card,
        fontSize: 16,
        fontWeight: '700',
    },
    supportHoursCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    supportHoursText: {
        flex: 1,
    },
    supportHoursTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.text,
        marginBottom: 4,
    },
    supportHoursSubtitle: {
        fontSize: 14,
        color: BrandColors.mutedText,
    },
});
